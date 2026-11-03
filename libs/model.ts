import type { AnimationClip, Group, Mesh, Scene } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export type ModelOptions = {
  receiveShadow: boolean
  castShadow: boolean
}

export type LoadedModel = {
  model: Group
  animations: AnimationClip[]
}

export function loadGLTFModel(
  scene: Scene,
  glbPath: string,
  options: ModelOptions = {
    receiveShadow: true,
    castShadow: true
  }
): Promise<LoadedModel> {
  const { receiveShadow, castShadow } = options

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.load(
      glbPath,
      gltf => {
        const model = gltf.scene
        model.receiveShadow = receiveShadow
        model.castShadow = castShadow
        scene.add(model)

        model.traverse(function (child) {
          if ((child as Mesh).isMesh) {
            child.castShadow = castShadow
            child.receiveShadow = receiveShadow
          }
        })
        resolve({ model, animations: gltf.animations })
      },
      undefined,
      function (error) {
        reject(error)
      }
    )
  })
}
