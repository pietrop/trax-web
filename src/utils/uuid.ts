import { v4 } from 'uuid'

export type UUID = string

export function uuid(): UUID {
    return v4()
}
