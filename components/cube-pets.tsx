import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { loadGLTFModel } from '../libs/model'
import { PETS } from '../libs/pets'
import { PetsSpinner, PetsContainer } from './cube-pets-loader'

// Half the visible width of the scene in world units. The row spans about
// ±3.6, so this leaves a margin either side; the height follows the
// container's aspect ratio.
const HALF_WIDTH = 4.4
// The pets stand on y = 0 and are about 2.4 units tall.
const FLOOR_Y = 0
// The opening spin around the row, in seconds.
const INTRO_SECONDS = 2

function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

// A soft round shadow to ground each pet, drawn once on a 2D canvas.
function makeShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
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
      ;(material as THREE.MeshBasicMaterial).map?.dispose()
      material.dispose()
    }
  })
}

const CubePets = () => {
  const refContainer = useRef<HTMLDivElement>(null)

  // This component only renders on the client (see NoSsr), so it's safe to
  // probe for WebGL here. three.js r163+ requires WebGL 2. Without it the
  // pets are skipped instead of throwing and taking down the whole page.
  const [webglAvailable] = useState(() => WebGL.isWebGL2Available())
  const [loading, setLoading] = useState(webglAvailable)

  useEffect(() => {
    const { current: container } = refContainer
    if (!container || !webglAvailable) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
    } catch (err) {
      // Context creation can still fail after the WebGL 2 probe (e.g. GPU
      // process crash). Never let that unmount the whole app.
      console.warn('Cube pets disabled: could not create a WebGL context', err)
      return
    }

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const target = new THREE.Vector3(0, 1.1, 0)
    // Straight in front of the row and a little above it.
    const initialCameraPosition = new THREE.Vector3(0, 7, 20)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50000)
    const fitCamera = () => {
      const aspect = container.clientWidth / container.clientHeight
      camera.left = -HALF_WIDTH
      camera.right = HALF_WIDTH
      camera.top = HALF_WIDTH / aspect
      camera.bottom = -HALF_WIDTH / aspect
      camera.updateProjectionMatrix()
    }
    fitCamera()
    camera.position.copy(initialCameraPosition)
    camera.lookAt(target)

    // three r155+ uses physically-correct lighting; intensities are scaled
    // by PI to match the brightness of the old legacy-lights mode.
    scene.add(new THREE.AmbientLight(0xffffff, Math.PI * 0.7))
    const sun = new THREE.DirectionalLight(0xffffff, Math.PI * 0.6)
    sun.position.set(4, 10, 8)
    scene.add(sun)

    // Drag to look around, but stay in front of the row and above the floor.
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(target)
    controls.enablePan = false
    controls.minAzimuthAngle = -Math.PI / 4
    controls.maxAzimuthAngle = Math.PI / 4
    controls.maxPolarAngle = Math.PI / 2

    const shadowTexture = makeShadowTexture()
    const mixers: THREE.AnimationMixer[] = []

    PETS.forEach(pet => {
      if (shadowTexture) {
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(2.8, 2.8),
          new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false
          })
        )
        shadow.rotation.x = -Math.PI / 2
        shadow.position.set(pet.x, FLOOR_Y - 0.01, 0)
        scene.add(shadow)
      }
    })

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
        const p = initialCameraPosition
        // Ten turns, slowing down to stop in front of the row.
        const rotSpeed = -easeOutCirc(progress) * Math.PI * 20

        camera.position.y = p.y
        camera.position.x = p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
        camera.position.z = p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
        camera.lookAt(target)
      } else {
        controls.update()
      }

      renderer.render(scene, camera)
    }

    Promise.allSettled(
      PETS.map((pet, i) =>
        loadGLTFModel(scene, pet.url, {
          receiveShadow: false,
          castShadow: false
        }).then(({ model, animations }) => {
          // Stand the pet on the floor, centred on its spot in the row.
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          model.position.set(pet.x - center.x, FLOOR_Y - box.min.y, -center.z)
          const idle = THREE.AnimationClip.findByName(animations, 'idle')
          if (idle) {
            const mixer = new THREE.AnimationMixer(model)
            mixer.clipAction(idle).play()
            // Offset each pet so they don't bob in lockstep.
            mixer.setTime(i * 0.3)
            mixers.push(mixer)
          }
        })
      )
    ).then(results => {
      for (const result of results) {
        if (result.status === 'rejected') {
          console.warn('Cube pet failed to load', result.reason)
        }
      }
      if (disposed) return
      if (results.some(r => r.status === 'fulfilled')) animate()
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
    <PetsContainer ref={refContainer}>
      {loading && <PetsSpinner />}
    </PetsContainer>
  )
}

export default CubePets
