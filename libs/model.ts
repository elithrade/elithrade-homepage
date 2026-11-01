import type { Group, Mesh, Scene } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export type ModelOptions = {
  receiveShadow: boolean
  castShadow: boolean
}

export function loadGLTFModel(
  scene: Scene,
  glbPath: string,
  options: ModelOptions = {
    receiveShadow: true,
    castShadow: true
  }
): Promise<Group> {
  const { receiveShadow, castShadow } = options

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.load(
      glbPath,
      gltf => {
        const obj = gltf.scene
        obj.name = 'dog'
        obj.position.y = 0
        obj.position.x = 0
        obj.receiveShadow = receiveShadow
        obj.castShadow = castShadow
        scene.add(obj)

        obj.traverse(function (child) {
          if ((child as Mesh).isMesh) {
            child.castShadow = castShadow
            child.receiveShadow = receiveShadow
          }
        })
        resolve(obj)
      },
      undefined,
      function (error) {
        reject(error)
      }
    )
  })
}
