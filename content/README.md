# content

Site content that is kept as data rather than written into the pages. Each
file has one source, listed here; edit it there, not here.

| File      | Source                                                                                                  | Read by              |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| `cv.json` | The CV, [elithrade/My-Awesome-CV](https://github.com/elithrade/My-Awesome-CV) (`examples/resume/*.tex`) | `libs/content/cv.ts` |

## cv.json

The parts of the CV the site shows: summary, skills, education and positions.
Contact details are deliberately left out.

- `schemaVersion` is 2. The shape is the `Cv` type in `libs/content/cv.ts`;
  `npm run typecheck` rejects a file of another shape, and
  `libs/content/cv.test.ts` checks what types can't.
- `summary` paragraphs may contain `{years}`, which the home page replaces with
  the years of experience counted from the earliest position's start.
- Dates are `YYYY-MM`, or `YYYY` where the CV gives no month. A position's
  `end` of `null` means it is current. A degree the CV dates with one year has
  that year as its `end` and a `start` of `null`.
- A skills row the CV writes as `Azure (Functions, ...), AWS (Lambda, ...)` is
  one category per name here, `Azure` and `AWS`.
- Text uses plain ASCII hyphens, as the CV does. The site swaps hyphens inside
  words for non-breaking ones when it renders. Apostrophes and quotes are the
  curly ones the PDF shows.
- The file is formatted as `JSON.stringify(cv, null, 2)` writes it, and is
  listed in `.prettierignore` so that Prettier leaves it that way.
- Website-only details the CV doesn't have (short names, links) are in
  `libs/content/organisations.ts`, keyed by the CV's organisation name.
- The order the home page shows the skill categories in is set in
  `libs/content/skills.ts`, keyed by the CV's category name: which ones lead
  and which come last. The rest sit between them in the order they have here.
- Tests take the wording they expect from this file, so a reworded summary or
  a changed skill passes. A change fails a test only where the site needs a
  matching edit: an organisation without details, or a skill category that
  `libs/content/skills.ts` names and the CV no longer has.

For now this file is kept in step with the CV by hand. The plan is for the CV
repository's CI to export it and open a PR here whenever the CV changes, at
which point it must not be edited by hand.
