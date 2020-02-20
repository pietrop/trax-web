import { Range } from 'src/models'

export function contained(x: number, range: Range) {
    return x >= range.start && x <= range.end
}
