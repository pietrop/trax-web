import { WorkerId } from '.'

export interface SessionStatus {
    workerId: WorkerId
    active: boolean
    startedAt: Date
    glossaryModifiedAt: Date
    audioUrl: string
    attachments: any
}
