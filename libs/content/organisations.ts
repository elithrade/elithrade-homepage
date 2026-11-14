// Website-only details for the organisations named in content/cv.json, which
// the CV itself doesn't carry: the short name the site shows and a link.
// Keyed by the organisation's name exactly as the CV spells it. A test fails
// when the CV names an organisation that isn't listed here.

export type OrganisationDetails = {
  /** Shown on the site instead of the CV's full name. */
  name: string
  url: string
}

export const organisationDetails: Record<string, OrganisationDetails> = {
  'University of New South Wales': {
    name: 'University of New South Wales',
    url: 'https://unsw.edu.au'
  },
  Fugro: { name: 'Fugro', url: 'https://www.fugro.com' },
  'RAC WA': { name: 'RAC WA', url: 'https://rac.com.au' }
}

export function detailsFor(cvName: string): OrganisationDetails {
  const details = organisationDetails[cvName]
  if (!details) {
    throw new Error(
      `No website details for "${cvName}"; add it to libs/content/organisations.ts`
    )
  }
  return details
}
