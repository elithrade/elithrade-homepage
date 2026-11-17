// Lesson flashcards the site shows at /lessons, one file per project in
// content/lessons/ (see content/README.md). Typing each import as Lessons
// makes `next build` (and `npm run typecheck`) reject a file of the wrong
// shape; lessons.test.ts checks what types can't.

import urlShortener from '../../content/lessons/url-shortener.json'

/** Text in the subset of Markdown the cards use: `code` and **bold**. */
export type InlineMarkdown = string

export type LessonProject = {
  /** The project's address, /lessons/<id>. */
  id: string
  name: string
  description: string
  /** Where the cards are written: the project's LESSONS.md. */
  source: string
}

export type LessonCard = {
  /** Made from the question; unique within the project. */
  id: string
  question: InlineMarkdown
  /** Paragraphs. */
  answer: InlineMarkdown[]
}

export type LessonSection = {
  /** The section's number in LESSONS.md, from 1. */
  n: number
  /** Made from the title; the section's address, /lessons/<project>/<id>. */
  id: string
  title: InlineMarkdown
  /** Paragraphs written above the section's cards; usually none. */
  intro: InlineMarkdown[]
  cards: LessonCard[]
}

export type Lessons = {
  schemaVersion: number
  project: LessonProject
  sections: LessonSection[]
}

/** Every project's lessons, in the order /lessons lists them. */
export const lessonProjects: Lessons[] = [urlShortener]
