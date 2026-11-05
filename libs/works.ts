// Projects shown on /works. The project write-ups are curated by hand from the
// CV (github.com/elithrade/My-Awesome-CV, examples/resume/experience.tex), so
// review them when the CV's experience changes. Each organisation's name, role
// and period come from content/cv.json.

import { cv, yearRange } from './content/cv'
import { detailsFor } from './content/organisations'

export type Organisation = {
  name: string
  role: string
  period: string
}

/** The organisation as the CV names it, with the site's short name. */
function organisation(cvName: string): Organisation {
  const position = cv.experience.find(p => p.organisation === cvName)
  if (!position) throw new Error(`content/cv.json has no position at ${cvName}`)
  return {
    name: detailsFor(cvName).name,
    role: position.title,
    period: yearRange(position, ' – ')
  }
}

export type Work = {
  /** URL slug: /works/<id> */
  id: string
  title: string
  organisation: Organisation
  summary: string
  highlights: string[]
  /** Technologies named in the CV for this work; may be empty. */
  stack: string[]
}

export const RACWA = organisation('RACWA')

export const FUGRO = organisation('Fugro Marine Australia')

export const organisations = [RACWA, FUGRO]

export const works: Work[] = [
  {
    id: 'roadside-self-service',
    title: 'Roadside Assistance self-service',
    organisation: RACWA,
    summary:
      'A self-service capability in the myRAC portal that lets members manage their Roadside Assistance cover online, instantly.',
    highlights: [
      'Automates around 3,700 member requests a year',
      'Improved operational efficiency and member satisfaction'
    ],
    stack: []
  },
  {
    id: 'digital-membership-card',
    title: 'Digital membership card',
    organisation: RACWA,
    summary:
      "Lets members securely add their RAC membership card to their phone's digital wallet.",
    highlights: [
      '96% member uptake within three months of launch',
      'Led end-to-end development, including threat modelling and security architecture'
    ],
    stack: []
  },
  {
    id: 'website-search',
    title: 'Website search migration',
    organisation: RACWA,
    summary:
      "Replaced the RAC website's Azure Search with a vendor-hosted Solr solution.",
    highlights: [
      'Cut search time in half',
      'Improved content discoverability across the main site'
    ],
    stack: ['Solr']
  },
  {
    id: 'myrac-replatform',
    title: 'myRAC re-platform and redesign',
    organisation: RACWA,
    summary: 'A major re-platforming and redesign of the myRAC member portal.',
    highlights: [
      'Led the migration of the Next.js front end, GraphQL layer and back-end services into a single monorepo',
      'Delivered a complete UX redesign with new navigation and back-end integrations'
    ],
    stack: ['Next.js', 'GraphQL']
  },
  {
    id: 'autoservice-rego-lookup',
    title: 'Autoservice registration lookup',
    organisation: RACWA,
    summary:
      'Integrated a third-party vehicle registration lookup service into the Autoservice booking platform.',
    highlights: [
      'Full-stack: front-end booking workflows and back-end APIs',
      'Less data entry, and a significant drop in members abandoning the booking journey'
    ],
    stack: []
  },
  {
    id: 'rov-video-streaming',
    title: 'Real-time ROV inspection streaming',
    organisation: FUGRO,
    summary:
      'A low-latency live video platform for remote ROV inspections of seabed pipelines.',
    highlights: [
      'Around 6 seconds of end-to-end latency',
      'Built the streaming front end and a full-stack admin system for client channels and users',
      'Fully automated CI/CD deployment with AWS CDK'
    ],
    stack: [
      'AWS Elemental MediaLive',
      'AWS Elemental MediaStore',
      'CloudFront',
      'React',
      'Material UI',
      'TypeScript',
      'DynamoDB',
      'AWS CDK'
    ]
  },
  {
    id: 'usv-data-exchange',
    title: 'Uncrewed vessel data exchange',
    organisation: FUGRO,
    summary:
      'Scalable AWS systems, including a data exchange for uncrewed surface vessels (USVs) and a marine vessel reporting website.',
    highlights: ['Architected and deployed scalable systems on AWS'],
    stack: [
      '.NET Core',
      'TypeScript',
      'Docker',
      'AWS Lambda',
      'ECS/Fargate',
      'S3',
      'DynamoDB'
    ]
  },
  {
    id: 'sonar-classification',
    title: 'Multibeam sonar classification',
    organisation: FUGRO,
    summary:
      'A cloud-hosted machine learning system that automatically classifies multibeam sonar data.',
    highlights: [
      'Automated data processing workflows for vessel-based pipe inspections, significantly reducing manual effort'
    ],
    stack: []
  },
  {
    id: 'acquisition-suite',
    title: 'Data acquisition suite modernisation',
    organisation: FUGRO,
    summary:
      "Core modules for Fugro's next-generation global data acquisition software suite.",
    highlights: [
      'Led a team refactoring monolithic applications into a service-oriented architecture',
      'Architected and maintained core modules with .NET and WPF'
    ],
    stack: ['.NET', 'WPF']
  }
]

export function getWork(id: string): Work | undefined {
  return works.find(work => work.id === id)
}

export function worksFor(organisation: Organisation): Work[] {
  return works.filter(work => work.organisation === organisation)
}
