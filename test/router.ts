// The router that `useRouter` from next/router returns in tests (mocked in
// test/setup.ts). Pages render outside Next, so there is no real one. Call
// setPath before rendering a component that reads the URL.
export const router = { asPath: '/' }

export const setPath = (path: string) => {
  router.asPath = path
}
