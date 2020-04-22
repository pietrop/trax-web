import { WorkerId } from '.'
import { Attachment } from './attachment'

export interface SessionStatus {
    workerId: WorkerId
    active: boolean
    startedAt: Date
    glossaryModifiedAt: Date
    audioUrl: string
    attachments: Attachment[]
}
