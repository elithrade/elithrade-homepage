import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import {
  ARENA_MODELS,
  PIECES,
  SOLDIERS,
  arenaModelUrl,
  type ArenaModel,
  type Piece
} from '../libs/arena'
import { ArenaSpinner, ArenaContainer } from './mini-arena-loader'

// Half the visible width of the scene in world units; the arena is about 10
// tiles across. The height follows the container's aspect ratio.
const HALF_WIDTH = 5.9
// The opening spin around the arena, in seconds.
const INTRO_SECONDS = 2
// Where the camera comes to rest: in front of the arena, a little to the
// left and about 29° above it, like the pack's sample image. Together with
// the target below, this leaves a similar margin above the tallest piece
// and below the front floor slabs.
const REST_AZIMUTH = -0.12 * Math.PI
const CAMERA_DISTANCE = 20
const CAMERA_HEIGHT = 11

function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

const DEG = Math.PI / 180

function place(object: THREE.Object3D, piece: Omit<Piece, 'model'>) {
  object.position.set(piece.x, piece.y ?? 0, piece.z)
  object.rotation.y = (piece.turn ?? 0) * DEG
}

function enableShadows(object: THREE.Object3D) {
  object.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material]
    for (const material of materials) {
      ;(material as THREE.MeshStandardMaterial).map?.dispose()
      material.dispose()
    }
  })
}

const MiniArena = () => {
  const refContainer = useRef<HTMLDivElement>(null)

  // This component only renders on the client (see NoSsr), so it's safe to
  // probe for WebGL here. three.js r163+ requires WebGL 2. Without it the
  // arena is skipped instead of throwing and taking down the whole page.
  const [webglAvailable] = useState(() => WebGL.isWebGL2Available())
  const [loading, setLoading] = useState(webglAvailable)

  useEffect(() => {
    const { current: container } = refContainer
    if (!container || !webglAvailable) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch (err) {
      // Context creation can still fail after the WebGL 2 probe (e.g. GPU
      // process crash). Never let that unmount the whole app.
      console.warn('Arena disabled: could not create a WebGL context', err)
      return
    }

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const target = new THREE.Vector3(0.5, 1.0, -0.3)
    const restPosition = new THREE.Vector3(
      CAMERA_DISTANCE * Math.sin(REST_AZIMUTH),
      CAMERA_HEIGHT,
      CAMERA_DISTANCE * Math.cos(REST_AZIMUTH)
    ).add(new THREE.Vector3(target.x, 0, target.z))

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000)
    const fitCamera = () => {
      const aspect = container.clientWidth / container.clientHeight
      camera.left = -HALF_WIDTH
      camera.right = HALF_WIDTH
      camera.top = HALF_WIDTH / aspect
      camera.bottom = -HALF_WIDTH / aspect
      camera.updateProjectionMatrix()
    }
    fitCamera()
    camera.position.copy(restPosition)
    camera.lookAt(target)

    // three r155+ uses physically-correct lighting; intensities are scaled
    // by PI to match the brightness of the old legacy-lights mode.
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6a5a6a, Math.PI * 0.5))
    const sun = new THREE.DirectionalLight(0xfff1dc, Math.PI * 0.85)
    // From the right, so shadows fall to the left as in the sample image.
    sun.position.set(9, 12, 4)
    sun.target.position.set(0, 0, -0.5)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 40
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.02
    sun.shadow.radius = 3
    scene.add(sun, sun.target)

    // Drag to look around, but stay in front of the arena and above it.
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(target)
    controls.enablePan = false
    controls.minAzimuthAngle = REST_AZIMUTH - Math.PI / 4
    controls.maxAzimuthAngle = REST_AZIMUTH + Math.PI / 4
    controls.maxPolarAngle = Math.PI / 2.4

    const mixers: THREE.AnimationMixer[] = []
    let disposed = false
    let req: number | null = null
    let introStart: number | null = null
    const timer = new THREE.Timer()
    timer.connect(document)

    const animate = (timestamp?: number) => {
      req = requestAnimationFrame(animate)

      timer.update(timestamp)
      const delta = timer.getDelta()
      for (const mixer of mixers) mixer.update(delta)

      // Time-based, so the spin lasts as long on a 120 Hz display as on 60 Hz.
      const elapsed = timer.getElapsed()
      introStart ??= elapsed
      const progress = (elapsed - introStart) / INTRO_SECONDS

      if (progress < 1) {
        // Ten turns around the arena, slowing down to stop at the rest view.
        const angle = -easeOutCirc(progress) * Math.PI * 20
        const offset = restPosition.clone().sub(target)
        offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle)
        camera.position.copy(target).add(offset)
        camera.lookAt(target)
      } else {
        controls.update()
      }

      renderer.render(scene, camera)
    }

    // Load each model once, then place a copy of it for every piece.
    const loader = new GLTFLoader()
    Promise.allSettled(
      ARENA_MODELS.map(model => loader.loadAsync(arenaModelUrl(model)))
    ).then(results => {
      const models = new Map<ArenaModel, GLTF>()
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          models.set(ARENA_MODELS[i], result.value)
        } else {
          console.warn('Arena model failed to load', result.reason)
        }
      })
      if (disposed) return

      for (const piece of PIECES) {
        const gltf = models.get(piece.model)
        if (!gltf) continue
        const object = gltf.scene.clone()
        place(object, piece)
        enableShadows(object)
        scene.add(object)
      }

      const soldier = models.get('character-soldier')
      const spear = models.get('weapon-spear')
      if (soldier) {
        SOLDIERS.forEach((spec, i) => {
          const object = cloneSkinned(soldier.scene)
          place(object, spec)
          if (spear && spec.spear) {
            const hand = object.getObjectByName('arm-right')
            const weapon = spear.scene.clone()
            weapon.position.set(-0.03, -0.12, 0.05)
            hand?.add(weapon)
          }
          enableShadows(object)
          scene.add(object)

          const clip = THREE.AnimationClip.findByName(
            soldier.animations,
            spec.animation
          )
          if (clip) {
            const mixer = new THREE.AnimationMixer(object)
            mixer.clipAction(clip).play()
            // Offset each soldier so they don't move in lockstep.
            mixer.setTime(i * 0.4)
            mixers.push(mixer)
          }
        })
      }

      if (models.size > 0) animate()
      setLoading(false)
    })

    const handleWindowResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight)
      fitCamera()
    }
    window.addEventListener('resize', handleWindowResize, false)

    return () => {
      disposed = true
      if (req !== null) cancelAnimationFrame(req)
      window.removeEventListener('resize', handleWindowResize, false)
      for (const mixer of mixers) mixer.stopAllAction()
      timer.dispose()
      controls.dispose()
      disposeScene(scene)
      renderer.domElement.remove()
      renderer.dispose()
    }
  }, [webglAvailable])

  return (
    <ArenaContainer ref={refContainer}>
      {loading && <ArenaSpinner />}
    </ArenaContainer>
  )
}

export default MiniArena
