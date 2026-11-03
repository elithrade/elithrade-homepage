import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Scene, Group, Mesh, Object3D, AnimationClip } from 'three'
import { loadGLTFModel } from './model'

const { load } = vi.hoisted(() => ({ load: vi.fn() }))

vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load = load
  }
}))

// Model with a top-level mesh, a mesh nested inside a group, and a non-mesh.
function makeModel() {
  const root = new Group()
  const topMesh = new Mesh()
  const nestedGroup = new Group()
  const nestedMesh = new Mesh()
  const marker = new Object3D()
  nestedGroup.add(nestedMesh)
  root.add(topMesh, nestedGroup, marker)
  root.position.set(5, 6, 7)
  return { root, meshes: [topMesh, nestedMesh], marker }
}

function loaderSucceedsWith(model: Group, animations: AnimationClip[] = []) {
  load.mockImplementation((_path, onLoad) =>
    onLoad({ scene: model, animations })
  )
}

describe('loadGLTFModel', () => {
  beforeEach(() => {
    load.mockReset()
  })

  it('loads the given path and adds the model to the scene', async () => {
    const { root } = makeModel()
    const idle = new AnimationClip('idle', 1, [])
    loaderSucceedsWith(root, [idle])
    const scene = new Scene()

    const { model, animations } = await loadGLTFModel(scene, '/pet.glb', {
      receiveShadow: false,
      castShadow: false
    })

    expect(load).toHaveBeenCalledWith(
      '/pet.glb',
      expect.any(Function),
      undefined,
      expect.any(Function)
    )
    expect(model).toBe(root)
    expect(animations).toEqual([idle])
    expect(scene.children).toContain(root)
  })

  it('leaves positioning to the caller', async () => {
    const { root } = makeModel()
    loaderSucceedsWith(root)

    const { model } = await loadGLTFModel(new Scene(), '/pet.glb')

    expect(model.position.toArray()).toEqual([5, 6, 7])
  })

  it('applies shadow options to the model and every nested mesh', async () => {
    const { root, meshes, marker } = makeModel()
    loaderSucceedsWith(root)

    await loadGLTFModel(new Scene(), '/pet.glb', {
      receiveShadow: true,
      castShadow: false
    })

    expect(root.receiveShadow).toBe(true)
    expect(root.castShadow).toBe(false)
    for (const mesh of meshes) {
      expect(mesh.receiveShadow).toBe(true)
      expect(mesh.castShadow).toBe(false)
    }
    // Non-mesh children are left at three.js defaults.
    expect(marker.receiveShadow).toBe(false)
    expect(marker.castShadow).toBe(false)
  })

  it('casts and receives shadows by default', async () => {
    const { root, meshes } = makeModel()
    loaderSucceedsWith(root)

    await loadGLTFModel(new Scene(), '/pet.glb')

    for (const mesh of meshes) {
      expect(mesh.castShadow).toBe(true)
      expect(mesh.receiveShadow).toBe(true)
    }
  })

  it('rejects and leaves the scene empty when loading fails', async () => {
    const error = new Error('404 Not Found')
    load.mockImplementation((_path, _onLoad, _onProgress, onError) =>
      onError(error)
    )
    const scene = new Scene()

    await expect(loadGLTFModel(scene, '/missing.glb')).rejects.toBe(error)
    expect(scene.children).toHaveLength(0)
  })
})
