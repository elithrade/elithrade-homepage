import { useState } from 'react'
import { Button, ButtonGroup, useColorModeValue } from '@chakra-ui/react'
import HeroScene from './hero-scene'
import { SCENES, HERO_SCENE } from '../libs/scenes'
import type { SceneDef } from '../libs/scenes/types'

// Remembers the visitor's pick in their browser, so it sticks across pages
// and visits. Storage can be missing or blocked (private windows, blocked
// site data), so every access is guarded and the default scene is the
// fallback.
const STORAGE_KEY = 'hero-scene'

function savedScene(): SceneDef {
  try {
    const name = window.localStorage.getItem(STORAGE_KEY)
    return SCENES.find(scene => scene.name === name) ?? HERO_SCENE
  } catch {
    return HERO_SCENE
  }
}

function saveScene(scene: SceneDef) {
  try {
    window.localStorage.setItem(STORAGE_KEY, scene.name)
  } catch {
    // Not remembered, but the switch still works for this page.
  }
}

// The hero scene with a small switch in its corner for picking which scene
// to show. Client-only (it's rendered inside NoSsr), so it can read storage
// while rendering.
const HeroScenes = () => {
  const [scene, setScene] = useState(savedScene)
  const accent = useColorModeValue('purple', 'orange')

  const choose = (next: SceneDef) => {
    setScene(next)
    saveScene(next)
  }

  return (
    <HeroScene scene={scene}>
      <ButtonGroup
        role="group"
        aria-label="3D scene"
        size="xs"
        isAttached
        position="absolute"
        right={2}
        bottom={2}
        // Chakra gives a focused button in an attached group z-index 1, the
        // same as the navbar. Level 0 keeps that inside the group, so the
        // whole switch stays under the navbar when the page scrolls.
        zIndex={0}
      >
        {SCENES.map(option => {
          const active = option === scene
          return (
            <Button
              key={option.name}
              aria-pressed={active}
              onClick={() => choose(option)}
              colorScheme={active ? accent : 'gray'}
              variant={active ? 'solid' : 'outline'}
              bg={active ? undefined : 'surface'}
            >
              {option.label}
            </Button>
          )
        })}
      </ButtonGroup>
    </HeroScene>
  )
}

export default HeroScenes
