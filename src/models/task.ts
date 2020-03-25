import { Text } from 'slate'
import { UUID } from 'src/utils/uuid'
import { Range } from 'src/utils/range'

export interface Word extends Text {
    text: string
    timing: Range
    speaker: string | null
}

export interface Segment {
    words: Word[]
    timing: Range
}

export interface Task {
    id: UUID
    type: 'edit' | 'review'
    text: {
        before: Segment
        editable: Segment
        after: Segment
    }
    timing: Range
}
