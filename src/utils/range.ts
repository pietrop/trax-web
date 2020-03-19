export interface Range {
    start: number
    end: number
}

export const Range = {
    contains(range: Range, x: number) {
        return x >= range.start && x <= range.end
    },
    before(range: Range, x: number) {
        return x > range.end
    },
    after(range: Range, x: number) {
        return x < range.start
    },
}
