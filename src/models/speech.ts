export interface Range {
    start: number
    end: number
}

export interface Word {
    text: string
    timing: Range
}

export interface Paragraph {
    id: number
    speakerId: number
    timing: Range
    words: Word[]
}

export interface ParagraphJSON {
    utt_id: number
    spk_id: number
    utt_start: number
    utt_end: number
    corrector_key: string
    word_list: Array<{
        word: string
        start: number
        end: number
    }>
}

export const decodeParagraph = (json: ParagraphJSON): Paragraph => ({
    id: json.utt_id,
    speakerId: json.spk_id,
    timing: {
        start: json.utt_start,
        end: json.utt_end,
    },
    words: json.word_list.map(w => ({ text: w.word, timing: { start: w.start, end: w.end } })),
})
