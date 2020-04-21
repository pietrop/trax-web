import { UUID } from 'src/utils/uuid'

export interface TermRequestBody {
    text: string
    fields: {
        comment: string | null
        url: string | null
    }
}

export interface GlossaryTerm {
    id: UUID
    text: string
    fields: {
        comment: string | null
        url: string | null
    }
}
