import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import type { Placement, SceneDef } from '../libs/scenes/types'
import { SceneSpinner, SceneContainer } from './hero-scene-loader'

// The opening spin around the scene, in seconds.
const INTRO_SECONDS = 2
const DEG = Math.PI / 180

function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

function place(object: THREE.Object3D, placement: Placement) {
  object.position.set(placement.x, placement.y ?? 0, placement.z)
  object.rotation.y = (placement.turn ?? 0) * DEG
  object.scale.setScalar(placement.scale ?? 1)
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

type HeroSceneProps = {
  scene: SceneDef
}

const HeroScene = ({ scene: def }: HeroSceneProps) => {
  const refContainer = useRef<HTMLDivElement>(null)

  // This component only renders on the client (see NoSsr), so it's safe to
  // probe for WebGL here. three.js r163+ requires WebGL 2. Without it the
  // scene is skipped instead of throwing and taking down the whole page.
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
      console.warn('3D scene disabled: could not create a WebGL context', err)
      return
    }

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const { camera: view, sun: sunDef } = def
    const target = new THREE.Vector3(...view.target)
    const azimuth = view.azimuth * DEG
    const restPosition = new THREE.Vector3(
      target.x + view.distance * Math.sin(azimuth),
      view.height,
      target.z + view.distance * Math.cos(azimuth)
    )

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000)
    const fitCamera = () => {
      const aspect = container.clientWidth / container.clientHeight
      camera.left = -view.halfWidth
      camera.right = view.halfWidth
      camera.top = view.halfWidth / aspect
      camera.bottom = -view.halfWidth / aspect
      camera.updateProjectionMatrix()
    }
    fitCamera()
    camera.position.copy(restPosition)
    camera.lookAt(target)

    // three r155+ uses physically-correct lighting; intensities are scaled
    // by PI to match the brightness of the old legacy-lights mode.
    const strength = { ambient: 1, sun: 1, ...def.lights }
    scene.add(
      new THREE.HemisphereLight(
        0xfff4e6,
        0x6a5a6a,
        Math.PI * 0.5 * strength.ambient
      )
    )
    const sun = new THREE.DirectionalLight(
      0xfff1dc,
      Math.PI * 0.85 * strength.sun
    )
    sun.position.copy(target).add(new THREE.Vector3(...sunDef.position))
    sun.target.position.copy(target)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const shadowCamera = sun.shadow.camera
    shadowCamera.left = shadowCamera.bottom = -sunDef.shadowExtent
    shadowCamera.right = shadowCamera.top = sunDef.shadowExtent
    shadowCamera.near = 0.5
    shadowCamera.far = 60
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.02
    sun.shadow.radius = 3
    scene.add(sun, sun.target)

    // Drag to look around, but stay above the scene, and in front of it
    // unless it turns like a turntable.
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(target)
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI / 2.4
    if (view.turntable) {
      controls.autoRotate = true
      // OrbitControls turns 2π/60 × speed radians per second.
      controls.autoRotateSpeed = 60 / view.turntable
    } else {
      controls.minAzimuthAngle = azimuth - Math.PI / 4
      controls.maxAzimuthAngle = azimuth + Math.PI / 4
    }

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
        // Ten turns around the scene, slowing down to stop at the rest view.
        const angle = -easeOutCirc(progress) * Math.PI * 20
        const offset = restPosition.clone().sub(target)
        offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle)
        camera.position.copy(target).add(offset)
        camera.lookAt(target)
      } else {
        controls.update(delta)
      }

      renderer.render(scene, camera)
    }

    // Load each model once, then place a copy of it wherever it's used.
    const loader = new GLTFLoader()
    const ids = Object.keys(def.models)
    Promise.allSettled(ids.map(id => loader.loadAsync(def.models[id]))).then(
      results => {
        const models = new Map<string, GLTF>()
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            models.set(ids[i], result.value)
          } else {
            console.warn('3D model failed to load', result.reason)
          }
        })
        if (disposed) return

        for (const piece of def.pieces) {
          const gltf = models.get(piece.model)
          if (!gltf) continue
          const object = gltf.scene.clone()
          place(object, piece)
          enableShadows(object)
          scene.add(object)
        }

        def.actors?.forEach((actor, i) => {
          const gltf = models.get(actor.model)
          if (!gltf) return
          // Skeleton-aware copy, so each actor animates on its own.
          const object = cloneSkinned(gltf.scene)
          place(object, actor)
          enableShadows(object)
          scene.add(object)

          const clip =
            actor.animation &&
            THREE.AnimationClip.findByName(gltf.animations, actor.animation)
          if (clip) {
            const mixer = new THREE.AnimationMixer(object)
            mixer.clipAction(clip).play()
            // Offset each actor so they don't move in lockstep.
            mixer.setTime(i * 0.4)
            mixers.push(mixer)
          }
        })

        if (models.size > 0) animate()
        setLoading(false)
      }
    )

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
  }, [webglAvailable, def])

  return (
    <SceneContainer ref={refContainer}>
      {loading && <SceneSpinner />}
    </SceneContainer>
  )
}

export default HeroScene
