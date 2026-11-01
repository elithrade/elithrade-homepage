import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { loadGLTFModel } from '../libs/model'
import { DogSpinner, DogContainer } from './voxel-dog-loader'

function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

const VoxelDog = () => {
  const refContainer = useRef<HTMLDivElement>(null)
  const refRenderer = useRef<THREE.WebGLRenderer | null>(null)

  // This component only renders on the client (see NoSsr), so it's safe to
  // probe for WebGL here. three.js r163+ requires WebGL 2. Without it the dog
  // is skipped instead of throwing and taking down the whole page.
  const [webglAvailable] = useState(() => WebGL.isWebGL2Available())
  const [loading, setLoading] = useState(webglAvailable)

  const urlDogGLB = '/dog.glb'

  const handleWindowResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (container && renderer) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      renderer.setSize(scW, scH)
    }
  }, [])

  useEffect(() => {
    const { current: container } = refContainer
    if (container && webglAvailable) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      let renderer: THREE.WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        })
      } catch (err) {
        // Context creation can still fail after the WebGL 2 probe (e.g. GPU
        // process crash). Never let that unmount the whole app.
        console.warn(
          'Voxel dog disabled: could not create a WebGL context',
          err
        )
        return
      }

      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(scW, scH)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.appendChild(renderer.domElement)

      refRenderer.current = renderer

      const scene = new THREE.Scene()
      const target = new THREE.Vector3(-0.5, 1.2, 0)

      const initialCameraPosition = new THREE.Vector3(
        20 * Math.sin(0.2 * Math.PI),
        10,
        20 * Math.cos(0.2 * Math.PI)
      )

      // 640 -> 240
      // 8   -> 6
      const scale = scH * 0.005 + 4.8
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        0.01,
        50000
      )
      camera.position.copy(initialCameraPosition)
      camera.lookAt(target)

      // three r155+ uses physically-correct lighting; scale by PI to match
      // the brightness of the old legacy-lights mode.
      const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI)
      scene.add(ambientLight)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.autoRotate = true
      controls.target = target

      loadGLTFModel(scene, urlDogGLB, {
        receiveShadow: false,
        castShadow: false
      })
        .then(() => {
          animate()
          setLoading(false)
        })
        .catch(err => {
          console.warn('Voxel dog failed to load', err)
          setLoading(false)
        })

      let req: number | null = null
      let frame = 0

      const animate = () => {
        req = requestAnimationFrame(animate)

        frame = frame <= 100 ? frame + 1 : frame

        if (frame <= 100) {
          const p = initialCameraPosition
          const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20

          camera.position.y = 10
          camera.position.x =
            p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
          camera.position.z =
            p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
          camera.lookAt(target)
        } else {
          controls.update()
        }

        renderer.render(scene, camera)
      }

      return () => {
        if (req !== null) cancelAnimationFrame(req)
        renderer.domElement.remove()
        renderer.dispose()
      }
    }
  }, [webglAvailable])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize, false)
    return () => {
      window.removeEventListener('resize', handleWindowResize, false)
    }
  }, [handleWindowResize])

  return (
    <DogContainer ref={refContainer}>{loading && <DogSpinner />}</DogContainer>
  )
}

export default VoxelDog
