# elithrade-homepage

[![CI](https://github.com/elithrade/elithrade-homepage/actions/workflows/ci.yml/badge.svg)](https://github.com/elithrade/elithrade-homepage/actions/workflows/ci.yml)
[![E2E Test](https://github.com/elithrade/elithrade-homepage/actions/workflows/e2e.yml/badge.svg)](https://github.com/elithrade/elithrade-homepage/actions/workflows/e2e.yml)

Personal homepage of Bin Hu: a small Next.js site with an animated 3D voxel dog,
light/dark themes, and a bio and skills page.

**Live:** https://mango-pebble-00502641e.3.azurestaticapps.net

## Tech stack

- [Next.js](https://nextjs.org) 16 (pages router, Turbopack) and React 19
- [Chakra UI](https://v2.chakra-ui.com) 2 and Emotion for styling and colour mode
- [framer-motion](https://motion.dev) for page and section transitions
- [three.js](https://threejs.org) for the voxel dog (`public/dog.glb`)
- [Vitest](https://vitest.dev) and Testing Library for unit tests
- [Playwright](https://playwright.dev) for end-to-end tests
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
| `npm run test:e2e`   | Build, start and run the Playwright tests |
| `npm run lint`       | Lint with ESLint                          |
| `npm run prettier`   | Format the codebase with Prettier         |

## Project structure

```
components/          UI components (navbar, theme toggle, voxel dog, ...)
e2e/                 Playwright end-to-end tests
  layouts/           Page layouts: main shell and animated article wrapper
libs/
  model.js           GLTF loader helper for the voxel dog
  theme.js           Chakra theme: colours, fonts, colour mode
pages/               Next.js routes (/ and /works)
public/              Static assets: dog.glb, images
test/                Test setup, helpers and page tests
```

## Testing

### Unit tests

Unit tests use Vitest with jsdom and `@testing-library/react`.

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

### End-to-end tests

The Playwright tests in `e2e/` run in Chromium against a production build
served with `next start` on port 3100. They cover:

- home page content
- the voxel dog loading and rendering
- the theme toggle, including persistence across reloads
- navigation and the 404 page
- the mobile menu

```sh
npx playwright install --with-deps chromium   # first time only
npm run test:e2e
```

`npm run test:e2e` builds the app first. To test a build you already have,
set `E2E_SKIP_BUILD=1`. Locally, Playwright reuses a server already running
on port 3100.

Import `test` and `expect` from `e2e/fixtures.js`, not from
`@playwright/test`. The fixture fails a test on any uncaught page error,
console error or HTTP 4xx/5xx response. If a test expects one, allow it with
`test.use({ allowedErrors: [/pattern/] })`.

If Chromium can't run on your machine (for example WSL without its system
libraries), run the tests in the Playwright Docker image:

```sh
docker run --rm --ipc=host --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$PWD:$PWD" -w "$PWD" mcr.microsoft.com/playwright:v1.64.1-noble \
  npm run test:e2e
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`): on every pull request to `main` and
  every push to it, runs `npm ci`, `npm run lint` and `npm test`. `main` is
  protected: the `test` check must pass before a PR can merge.
- **E2E Test** (`.github/workflows/e2e.yml`): a separate workflow that runs
  the Playwright suite against a production build on every pull request to
  `main`, every push to it, and on demand from the Actions tab. The HTML
  report and failure traces are uploaded as the `playwright-report`
  artifact.
- **Deploy** (`.github/workflows/azure-static-web-apps-*.yml`): Azure Static
  Web Apps builds and deploys every push to `main`. Each pull request gets
  its own preview environment, which is removed when the PR closes.

## License

[MIT](LICENSE) © Bin Hu
