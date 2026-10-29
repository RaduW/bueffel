// The prompt of the pronoun exercises: a sentence with a marked part (the
// noun phrase to replace, the part a question asks about)

export interface ContextPrompt {
  // What to do, e.g. "Replace the marked words with a pronoun"
  label: string
  before: string
  marked: string
  after: string
  // Shown in grey brackets after the marked part (e.g. the noun's gender)
  note?: string
}
