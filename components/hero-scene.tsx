import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import type { Piece, SceneDef } from '../libs/scenes/types'
import { buildModel } from '../libs/voxels/build'

// The opening turn around the scene, in seconds.
const INTRO_SECONDS = 2
const DEG = Math.PI / 180

// Starts at a speed the eye can follow and slows to a stop.
function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}

function disposeMeshes(object: THREE.Object3D) {
  object.traverse(obj => {
    const mesh = obj as THREE.Mesh<THREE.BufferGeometry, THREE.Material>
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
}

// What's on show: one scene's models, and where its camera is in its moves.
type Stage = {
  // Everything placed in the scene, under one node so it can be swapped out.
  root: THREE.Group
  mixers: THREE.AnimationMixer[]
  restPosition: THREE.Vector3
  // When the opening turn began, on the timer's clock; null until it has.
  introStart: number | null
  // Whether the turntable is still going. A drag stops it for good.
  turning: boolean
}

type Viewer = NonNullable<ReturnType<typeof createViewer>>

// Draws hero scenes into `container`, one at a time. The canvas, camera and
// lights are made once; show() swaps in a scene's models and settings.
function createViewer(container: HTMLDivElement) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  } catch (err) {
    // Context creation can still fail after the WebGL 2 probe (e.g. GPU
    // process crash). Never let that unmount the whole app.
    console.warn('3D scene disabled: could not create a WebGL context', err)
    return null
  }

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  const canvas = renderer.domElement
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const target = new THREE.Vector3()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000)
  let halfWidth = 1
  const fitCamera = () => {
    const aspect = container.clientWidth / container.clientHeight
    camera.left = -halfWidth
    camera.right = halfWidth
    camera.top = halfWidth / aspect
    camera.bottom = -halfWidth / aspect
    camera.updateProjectionMatrix()
  }

  // Each scene sets the lights' strengths and where they stand; see show().
  const ambient = new THREE.HemisphereLight(0xfff4e6, 0x6a5a6a)
  const sun = new THREE.DirectionalLight(0xfff1dc)
  sun.castShadow = true
  // A small map with a wide blur, so shadows have soft edges and don't read
  // as part of the models.
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.radius = 4
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 60
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.02
  // A weak, cool light from the side the sun doesn't reach. Without it the
  // models' dark sides merge with the page in dark mode.
  const fill = new THREE.DirectionalLight(0xdfe8ff)
  scene.add(ambient, sun, sun.target, fill, fill.target)

  // Drag to look around, but stay above the scene. Zooming is off so the
  // mouse wheel scrolls the page, and so is the controls' block on touch
  // scrolling: a swipe up or down scrolls the page, one to the side turns
  // the scene.
  const controls = new OrbitControls(camera, canvas)
  controls.enablePan = false
  controls.enableZoom = false
  controls.maxPolarAngle = Math.PI / 2.4
  canvas.style.touchAction = 'pan-y'

  // For visitors who ask their system for less motion the camera stays put:
  // no opening turn and no turntable. The small movements (typing, the tail,
  // the bee) carry on, and the scene can still be dragged.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let stage: Stage | null = null
  let req: number | null = null
  const timer = new THREE.Timer()
  timer.connect(document)

  const animate = (timestamp?: number) => {
    req = requestAnimationFrame(animate)
    if (!stage) return

    timer.update(timestamp)
    const delta = timer.getDelta()
    const calm = reducedMotion.matches
    for (const mixer of stage.mixers) mixer.update(delta)

    // Time-based, so the turn lasts as long on a 120 Hz display as on 60 Hz.
    const elapsed = timer.getElapsed()
    stage.introStart ??= elapsed
    const progress = calm ? 1 : (elapsed - stage.introStart) / INTRO_SECONDS

    if (progress < 1) {
      // Once around the scene, slowing down to stop at the rest view.
      const angle = -easeOutCubic(progress) * Math.PI * 2
      const offset = stage.restPosition.clone().sub(target)
      offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle)
      camera.position.copy(target).add(offset)
      camera.lookAt(target)
    } else {
      controls.autoRotate = stage.turning && !calm
      controls.update(delta)
    }

    renderer.render(scene, camera)
  }

  // Only draw while there's a scene to show and it's on screen.
  let visible = true
  const run = () => {
    if (!stage || !visible || req !== null) return
    // Don't count the time spent paused, or everything would jump ahead.
    timer.reset()
    req = requestAnimationFrame(animate)
  }
  const pause = () => {
    if (req !== null) cancelAnimationFrame(req)
    req = null
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[entries.length - 1].isIntersecting
    if (visible) run()
    else pause()
  })
  observer.observe(container)

  // A click or drag on the scene takes over from the turntable. A swipe that
  // scrolls the page ends in pointercancel instead, and leaves it turning.
  const stopTurning = () => {
    if (stage) stage.turning = false
  }
  canvas.addEventListener('pointerup', stopTurning)

  const handleWindowResize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    fitCamera()
  }
  window.addEventListener('resize', handleWindowResize, false)

  const clearStage = () => {
    if (!stage) return
    for (const mixer of stage.mixers) mixer.stopAllAction()
    scene.remove(stage.root)
    disposeMeshes(stage.root)
    stage = null
  }

  return {
    // Replaces the scene on show with `def` and plays its opening turn. The
    // models are built here from their layouts, which takes a few
    // milliseconds, so there's nothing to wait for.
    show(def: SceneDef) {
      clearStage()

      // Builds a model and stands it in the scene. The model sits in a holder
      // that carries the placement, so an animation that moves the whole
      // model moves it from there.
      const root = new THREE.Group()
      const add = ({ model, ...placement }: Piece) => {
        const built = buildModel(def.models[model])
        for (const mesh of built.object.children) {
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
        const holder = new THREE.Group()
        holder.position.set(placement.x, placement.y ?? 0, placement.z)
        holder.rotation.y = (placement.turn ?? 0) * DEG
        holder.scale.setScalar(placement.scale ?? 1)
        holder.add(built.object)
        root.add(holder)
        return built
      }

      def.pieces.forEach(add)
      const mixers: THREE.AnimationMixer[] = []
      def.actors?.forEach((actor, i) => {
        const { object, clips } = add(actor)
        const clip = clips.find(clip => clip.name === actor.animation)
        if (clip) {
          const mixer = new THREE.AnimationMixer(object)
          mixer.clipAction(clip).play()
          // Offset each actor so they don't move in lockstep.
          mixer.setTime(i * 0.4)
          mixers.push(mixer)
        }
      })
      scene.add(root)

      const { camera: view, sun: sunDef } = def
      target.set(...view.target)
      const azimuth = view.azimuth * DEG
      const restPosition = new THREE.Vector3(
        target.x + view.distance * Math.sin(azimuth),
        view.height,
        target.z + view.distance * Math.cos(azimuth)
      )
      halfWidth = view.halfWidth
      fitCamera()
      camera.position.copy(restPosition)
      camera.lookAt(target)

      // three r155+ uses physically-correct lighting; intensities are scaled
      // by PI to match the brightness of the old legacy-lights mode.
      const strength = { ambient: 1, sun: 1, fill: 1, ...def.lights }
      ambient.intensity = Math.PI * 0.5 * strength.ambient
      sun.intensity = Math.PI * 0.85 * strength.sun
      fill.intensity = Math.PI * 0.25 * strength.fill
      const [sunX, sunY, sunZ] = sunDef.position
      sun.position.set(target.x + sunX, target.y + sunY, target.z + sunZ)
      sun.target.position.copy(target)
      // The fill comes from across the scene from the sun, and lower.
      fill.position.set(target.x - sunX, target.y + sunY * 0.4, target.z - sunZ)
      fill.target.position.copy(target)
      const shadowCamera = sun.shadow.camera
      shadowCamera.left = shadowCamera.bottom = -sunDef.shadowExtent
      shadowCamera.right = shadowCamera.top = sunDef.shadowExtent
      shadowCamera.updateProjectionMatrix()

      // A turntable can be dragged all the way round. Otherwise the camera
      // stays in front of the scene.
      controls.target.copy(target)
      if (view.turntable) {
        // OrbitControls turns 2π/60 × speed radians per second.
        controls.autoRotateSpeed = 60 / view.turntable
        controls.minAzimuthAngle = -Infinity
        controls.maxAzimuthAngle = Infinity
      } else {
        controls.minAzimuthAngle = azimuth - Math.PI / 4
        controls.maxAzimuthAngle = azimuth + Math.PI / 4
      }

      stage = {
        root,
        mixers,
        restPosition,
        introStart: null,
        turning: Boolean(view.turntable)
      }
      run()
    },

    dispose() {
      pause()
      observer.disconnect()
      canvas.removeEventListener('pointerup', stopTurning)
      window.removeEventListener('resize', handleWindowResize, false)
      clearStage()
      timer.dispose()
      controls.dispose()
      canvas.remove()
      renderer.dispose()
    }
  }
}

type HeroSceneProps = {
  scene: SceneDef
  // Shown over the scene, such as controls. Left out without WebGL, since
  // there's no scene to control.
  children?: ReactNode
}

const HeroScene = ({ scene: def, children }: HeroSceneProps) => {
  const refContainer = useRef<HTMLDivElement>(null)
  const refViewer = useRef<Viewer | null>(null)

  // This component only renders on the client (see NoSsr), so it's safe to
  // probe for WebGL here. three.js r163+ requires WebGL 2. Without it the
  // scene is skipped instead of throwing and taking down the whole page.
  const [webglAvailable] = useState(() => WebGL.isWebGL2Available())

  useEffect(() => {
    const { current: container } = refContainer
    if (!container || !webglAvailable) return

    const viewer = createViewer(container)
    refViewer.current = viewer
    return () => {
      viewer?.dispose()
      refViewer.current = null
    }
  }, [webglAvailable])

  // Runs after the effect above, so the viewer is there on the first render
  // too.
  useEffect(() => {
    refViewer.current?.show(def)
  }, [def])

  // A fixed aspect ratio, so the scene just scales up or down with the page:
  // the camera always shows the same view. It fills the main column on narrow
  // screens but stops at 640px, so it sets the mood without pulling attention
  // from the content below.
  return (
    <Box
      ref={refContainer}
      className="hero-scene"
      mx="auto"
      mb={[2, 4, 6]}
      w="100%"
      maxW="640px"
      sx={{ aspectRatio: '640 / 380' }}
      position="relative"
    >
      {webglAvailable && children}
    </Box>
  )
}

export default HeroScene
