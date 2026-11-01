# elithrade-homepage

[![CI](https://github.com/elithrade/elithrade-homepage/actions/workflows/ci.yml/badge.svg)](https://github.com/elithrade/elithrade-homepage/actions/workflows/ci.yml)

Personal homepage of Bin Hu: a small Next.js site with an animated 3D voxel dog,
light/dark themes, and a bio and skills page.

**Live:** https://mango-pebble-00502641e.3.azurestaticapps.net

## Tech stack

- [Next.js](https://nextjs.org) 16 (pages router, Turbopack) and React 19
- [Chakra UI](https://v2.chakra-ui.com) 2 and Emotion for styling and colour mode
- [framer-motion](https://motion.dev) for page and section transitions
- [three.js](https://threejs.org) for the voxel dog (`public/dog.glb`)
- [Vitest](https://vitest.dev) and Testing Library for unit tests
- ESLint 10 (flat config) and Prettier

## Getting started

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Then open http://localhost:3000. The dev server listens on `0.0.0.0`, so other
devices on your network can reach it too.

## Scripts

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the dev server with hot reload      |
| `npm run build`      | Production build (`output: 'standalone'`) |
| `npm test`           | Run the unit tests once                   |
| `npm run test:watch` | Run the unit tests in watch mode          |
| `npm run lint`       | Lint with ESLint                          |
| `npm run prettier`   | Format the codebase with Prettier         |

## Project structure

```
components/          UI components (navbar, theme toggle, voxel dog, ...)
  layouts/           Page layouts: main shell and animated article wrapper
libs/
  model.js           GLTF loader helper for the voxel dog
  theme.js           Chakra theme: colours, fonts, colour mode
pages/               Next.js routes (/ and /works)
public/              Static assets: dog.glb, images
test/                Test setup, helpers and page tests
```

## Testing

Tests use Vitest with jsdom and `@testing-library/react`.

- Component and library tests sit next to the code they test, as
  `*.test.js` (for example `libs/model.test.js`).
- Page tests live in `test/pages/`. Next.js turns every file in `pages/`
  into a route, so tests can't go there.
- Render components with `renderWithTheme` from `test/test-utils.js`, which
  wraps them in the Chakra provider and site theme.
- `test/setup.js` loads jest-dom matchers, polyfills `matchMedia` and turns
  off framer-motion animations.

The project writes JSX in `.js` files. Vite skips JSX in `.js` by default, so
`vitest.config.mjs` opts the source folders in. If you add a new top-level
source folder, add it to the `oxc.include` pattern there.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): on every pull request to `main` and
  every push to it, runs `npm ci`, `npm run lint` and `npm test`. `main` is
  protected: the `test` check must pass before a PR can merge.
- **Deploy** (`.github/workflows/azure-static-web-apps-*.yml`): Azure Static
  Web Apps builds and deploys every push to `main`. Each pull request gets
  its own preview environment, which is removed when the PR closes.

## License

[MIT](LICENSE) © Bin Hu
