import { Task, Word, Glossary } from 'src/models'

interface WordJSON {
    word: string
    start: number
    end: number
    speaker: string | null
}

export interface TaskJSON {
    id: string
    text: {
        before: WordJSON[]
        editable: WordJSON[]
        after: WordJSON[]
    }
    editable_start: number
    editable_end: number
}

export interface GlossaryJSON {
    glossary: {term: string}[]
}

const toWord = (json: WordJSON): Word => ({
    text: json.word,
    timing: {
        start: json.start,
        end: json.end,
    },
    speaker: json.speaker,
})

export const toTask = (json: TaskJSON): Task => ({
    id: json.id,
    text: {
        before: json.text.before.map(toWord),
        editable: json.text.editable.map(toWord),
        after: json.text.after.map(toWord),
    },
    timing: {
        editable: {
            start: json.editable_start,
            end: json.editable_end,
        },
    },
})

export const toGlossary = (json: GlossaryJSON): Glossary => ({
    terms: json.glossary.map(term => term.term)
})
