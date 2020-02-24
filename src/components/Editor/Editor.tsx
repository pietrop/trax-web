import React, { useState, useMemo, useCallback } from 'react'
import { createEditor, Node, Text } from 'slate'
import { Slate, Editable, ReactEditor, withReact } from 'slate-react'
import { Paragraph, Word } from 'src/models'
import { contained } from 'src/utils/range'
import { Rect } from 'src/utils/rect'
import { Segment } from './Segment'
import { Marker } from './Marker'

function joinParagraphText(paragraph: Paragraph): Text {
    const { words } = paragraph
    let text = ''

    for (let i = 0; i < words.length; i++) {
        let curr = words[i]
        let next = i < words.length - 1 ? words[i + 1] : null
        text += curr.text

        if (next && next.text !== '.') {
            text += ' '
        }
    }

    return { text }
}

interface EditorProps {
    paragraphs: Paragraph[]
    currentTime: number
}

function useMarkerBoundingBox(editor: ReactEditor, paragraphs: Paragraph[], currentTime: number): Rect {
    const pi = paragraphs.findIndex(p => contained(currentTime, p.timing))
    if (pi === -1) {
        return Rect.empty
    }

    const paragraph = paragraphs[pi]
    const { offset, word } = findOffsetForTime(paragraph.words, currentTime)

    if (!offset || !word) {
        return Rect.empty
    }

    const anchor = {
        path: [pi],
        offset,
    }
    const focus = {
        path: [pi],
        offset: offset + word.text.length,
    }
    const range = { anchor, focus }
    const domRange = ReactEditor.toDOMRange(editor, range)
    const rect = domRange.getBoundingClientRect()
    return rect
}

function findOffsetForTime(words: Word[], time: number) {
    let offset = 0
    for (const [i, word] of words.entries()) {
        if (contained(time, word.timing)) {
            return { word, index: i, offset }
        }

        let next = i < words.length - 1 ? words[i + 1] : null

        if (word.timing.end < time) {
            offset += word.text.length
        }

        // add space
        if (next && next.text !== '.') {
            offset += 1
        }
    }

    return {}
}

export const TextEditor = ({ paragraphs, currentTime }: EditorProps) => {
    const editor = useMemo(() => withReact(createEditor()), [])
    const nodes = useMemo<Node[]>(() => {
        return paragraphs.map(p => ({
            type: 'paragraph',
            timing: p.timing,
            children: [joinParagraphText(p)],
        }))
    }, [paragraphs])

    const [value, setValue] = useState(nodes)

    const renderElement = useCallback(props => <Segment {...props} />, [])

    const markerRect = useMarkerBoundingBox(editor, paragraphs, currentTime)

    return (
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
            <Marker rect={markerRect} />
            <Editable
                spellCheck={false}
                renderElement={renderElement}
                style={{ position: 'relative', minHeight: '100%' }}
                // onKeyDown={event => {
                //     if (!event.ctrlKey) {
                //         return
                //     }

                //     // Replace the `onKeyDown` logic with our new commands.
                //     switch (event.key) {
                //         case '`': {
                //             event.preventDefault()
                //             // CustomEditor.toggleCodeBlock(editor)
                //             break
                //         }

                //         case 'b': {
                //             event.preventDefault()
                //             // CustomEditor.toggleBoldMark(editor)
                //             break
                //         }
                //     }
                // }}
            />
        </Slate>
    )
}
