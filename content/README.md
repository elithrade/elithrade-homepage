# content

Site content that is kept as data rather than written into the pages. Each
file has one source, listed here; edit it there, not here.

| File      | Source                                                                                                  | Read by              |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| `cv.json` | The CV, [elithrade/My-Awesome-CV](https://github.com/elithrade/My-Awesome-CV) (`examples/resume/*.tex`) | `libs/content/cv.ts` |

## cv.json

The parts of the CV the site shows: summary, skills, education, positions with
their works, and personal projects. Contact details are deliberately left out.

- `schemaVersion` is 3. The shape is the `Cv` type in `libs/content/cv.ts`;
  `npm run typecheck` rejects a file of another shape, and
  `libs/content/cv.test.ts` checks what types can't.
- `summary` paragraphs may contain `{years}`, which the home page replaces with
  the years of experience counted from the earliest position's start.
- Dates are `YYYY-MM`, or `YYYY` where the CV gives no month. A position's
  `end` of `null` means it is current. A degree the CV dates with one year has
  that year as its `end` and a `start` of `null`.
- A skills row the CV writes as `Azure (Functions, ...), AWS (Lambda, ...)` is
  one category per name here, `Azure` and `AWS`.
- A position's `works` are the bullets the CV groups with `\work{id}{title}`
  markers, word for word. Bullets the CV leaves unmarked are not exported. A
  position may have no works.
- `projects` are the CV's personal projects. A project's `id` is made from its
  name. Works and projects share the `/works/<id>` addresses, so their ids are
  unique across both.
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

This file is generated, so don't edit it by hand. On every push to its
`master`, the CV repository's CI exports it (`scripts/export-cv.ts` there) and,
when it differs from the copy here, opens a pull request from the branch
`sync/cv`, or adds to the one already open. If that pull request fails a test,
push the matching site edit to the same branch.
