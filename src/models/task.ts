import { Text } from 'slate'
import { UUID } from 'src/utils/uuid'
import { Range } from 'src/utils/range'

export interface Word extends Text {
    text: string
    timing: Range
    speaker: string | null
}

export interface Task {
    id: UUID
    text: {
        before: Word[]
        editable: Word[]
        after: Word[]
    }
    timing: {
        editable: Range
    }
}
