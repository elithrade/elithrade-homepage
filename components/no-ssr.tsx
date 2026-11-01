import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

type NoSsrProps = {
  children?: ReactNode
}

const NoSsr = (props: NoSsrProps) => <>{props.children}</>

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false
})
