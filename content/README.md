# content

Site content that is kept as data rather than written into the pages. Each
file has one source, listed here; edit it there, not here.

| File      | Source                                                                                                  | Read by              |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| `cv.json` | The CV, [elithrade/My-Awesome-CV](https://github.com/elithrade/My-Awesome-CV) (`examples/resume/*.tex`) | `libs/content/cv.ts` |

## cv.json

The parts of the CV the site shows: summary, skills, education and positions.
Contact details are deliberately left out.

- `summary` paragraphs may contain `{years}`, which the home page replaces with
  the years of experience counted from the earliest position's start.
- Dates are `YYYY-MM`; an `end` of `null` means the position is current.
- Text uses plain ASCII hyphens, as the CV does. The site swaps hyphens inside
  words for non-breaking ones when it renders.
- Website-only details the CV doesn't have (short names, links) are in
  `libs/content/organisations.ts`, keyed by the CV's organisation name.

For now this file is kept in step with the CV by hand. The plan is for the CV
repository's CI to export it and open a PR here whenever the CV changes, at
which point it must not be edited by hand.
