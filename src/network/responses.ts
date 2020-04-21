import { Task, Word, Glossary, SessionStatus, WorkerId, GlossaryTerm, TermRequestBody } from 'src/models'

export interface WorkerStatusJSON {
    id: string
}

export interface SessionStatusJSON {
    status: {
        session_started_at: string
        gloss_modified_at: string
        is_active: boolean
    }
    metadata: {
        audio_url: string
        attachments: any
    }
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
        fields: {
            comment: string | null
            url: string | null
        }
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
            speaker: json.segments.before.words[0]?.speaker,
            timing: {
                start: json.segments.before.start,
                end: json.segments.before.end,
            },
        },
        editable: {
            words: json.segments.body.words.map(toWord),
            speaker: json.segments.body.words[0]?.speaker,
            timing: {
                start: json.segments.body.start,
                end: json.segments.body.end,
            },
        },
        after: {
            words: json.segments.after.words.map(toWord),
            speaker: json.segments.after.words[0]?.speaker,
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
    terms: json.gloss.map((term) => ({
        id: term.id,
        text: term.text,
        fields: { comment: term.fields.comment, url: term.fields.url },
    })),
})

export const toGlossaryTerm = (data: TermRequestBody, response: any): GlossaryTerm => ({
    ...data,
    id: response.data.id,
})

export const toSessionStatus = (json: SessionStatusJSON, workerId: WorkerId): SessionStatus => ({
    workerId,
    active: json.status.is_active,
    startedAt: new Date(json.status.session_started_at),
    glossaryModifiedAt: new Date(json.status.gloss_modified_at),
    audioUrl: json.metadata.audio_url,
    attachments: json.metadata.attachments,
})
