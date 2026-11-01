import 'react'

// Some components pass deprecated HTML attributes (`align`, `justify`, `wrap`)
// to Chakra layout components such as Box and Container. Chakra forwards them
// to the DOM unchanged, and the page depends on them: `align="center"` on a
// div centres its contents. React's types omit these attributes, so declare
// them here instead of changing the rendered markup.
declare module 'react' {
  // The type parameter must match React's declaration for interfaces to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    align?: string
    justify?: string
    wrap?: string
  }
}
