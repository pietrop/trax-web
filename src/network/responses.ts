import { Task, Word, Glossary } from 'src/models'

export interface StatusJSON {
    id: string
}

interface WordJSON {
    word: string
    start: number
    end: number
    speaker: string | null
}

export interface TaskJSON {
    id: string
    type: 'edit' | 'review'
    start: number
    end: number
    segments: {
        before: {
            start: number
            end: number
            words: WordJSON[]
        }
        after: {
            start: number
            end: number
            words: WordJSON[]
        }
        body: {
            start: number
            end: number
            words: WordJSON[]
        }
    }
}

export interface GlossaryJSON {
    gloss: {
        id: string
        text: string
        comment: string
    }[]
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
    type: json.type,
    text: {
        before: {
            words: json.segments.before.words.map(toWord),
            timing: {
                start: json.segments.before.start,
                end: json.segments.before.end,
            },
        },
        editable: {
            words: json.segments.body.words.map(toWord),
            timing: {
                start: json.segments.body.start,
                end: json.segments.body.end,
            },
        },
        after: {
            words: json.segments.after.words.map(toWord),
            timing: {
                start: json.segments.after.start,
                end: json.segments.after.end,
            },
        },
    },
    timing: {
        start: json.start,
        end: json.end,
    },
})

export const toGlossary = (json: GlossaryJSON): Glossary => ({
    terms: json.gloss.map(term => term.text),
})
