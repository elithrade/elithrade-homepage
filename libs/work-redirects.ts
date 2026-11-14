// Works whose address changed when /works began to follow the CV: the old
// cards described the same projects under names the CV no longer uses.
// next.config.ts turns these into permanent redirects. A test fails when a
// destination is no longer a work, which means the CV renamed it again: point
// the redirect at the new id and add one from the id that went away.

export const workRedirects: Record<string, string> = {
  'usv-data-exchange': 'survey-data-exchange',
  'sonar-classification': 'pipeline-inspection'
}
