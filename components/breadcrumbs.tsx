import type { ReactNode } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

/** Names for the site's fixed path segments. */
const sectionNames: Record<string, string> = {
  works: 'Works',
  lessons: 'Lessons'
}

export type Crumb = { href: string; label: ReactNode }

/**
 * One crumb per segment of `path`, each linking to the path up to it. A
 * crumb's label comes from `labels` (keyed by its href), then the fixed
 * section names, then the segment itself.
 */
export const crumbsFromPath = (
  path: string,
  labels: Record<string, ReactNode> = {}
): Crumb[] => {
  const segments = path.split(/[?#]/)[0].split('/').filter(Boolean)
  return segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    return {
      href,
      label:
        labels[href] ?? sectionNames[segment] ?? decodeURIComponent(segment)
    }
  })
}

type BreadcrumbsProps = {
  /**
   * Names for this page's dynamic segments, keyed by the href up to that
   * segment, such as { '/works/digital-membership-card': 'Digital membership
   * card' }. Segments left out show as they appear in the URL.
   */
  labels?: Record<string, ReactNode>
}

// The trail from the current URL, such as Lessons > url-shortener >
// Concurrency and atomicity. Every crumb but the last links to its page. The
// last one is the current page: it stays on one line and is cut short with an
// ellipsis when it doesn't fit, so long titles don't wrap the trail on a phone.
export const Breadcrumbs = ({ labels }: BreadcrumbsProps) => {
  const { asPath } = useRouter()
  const crumbs = crumbsFromPath(asPath, labels)
  const current = crumbs.pop()
  if (!current) return null

  return (
    <Breadcrumb
      fontSize={15}
      mb={4}
      separator={<ChevronRightIcon color="text-muted" boxSize={4} />}
      spacing={1}
      listProps={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}
    >
      {crumbs.map(crumb => (
        <BreadcrumbItem key={crumb.href} flexShrink={0}>
          <BreadcrumbLink as={NextLink} href={crumb.href} color="accent">
            {crumb.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem isCurrentPage minW={0}>
        <BreadcrumbLink color="text-muted" noOfLines={1}>
          {current.label}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  )
}
