import React, { useCallback, useMemo, useState } from 'react'
import { Editor, Element, Node, NodeEntry, Path, Point, Range as SlateRange, Text } from 'slate'
import { Editable, ReactEditor, Slate } from 'slate-react'
import { Task, Word } from 'src/models'
import { Range } from 'src/utils/range'
import { isPunctuation } from 'src/utils/text'
import { BlockView } from './BlockView'
import { ContentView } from './ContentView'

interface EditorProps {
    editor: ReactEditor
    task: Task
    currentTime: number
    isAudioPlaying: boolean
    onCursorTimeChange: (timeForCursor: number) => void
}

interface Timing {
    chars: Range
    time: Range
}

export interface Block extends Element {
    type: 'block'
    editable: boolean
    children: Content[]
}

export interface Content extends Text {
    type: 'content'
    timings: Timing[]
    editable: boolean
    text: string
    timingHighlight?: 'before' | 'now' | 'after'
}

const Content = {
    isContent: (value: any): value is Content => {
        return value['type'] === 'content'
    },
}

function createContent(words: Word[], { editable }: { editable: boolean }): Content {
    let text = ''
    let timings = []

    for (let i = 0; i < words.length; i++) {
        let curr = words[i]
        let next = i < words.length - 1 ? words[i + 1] : null
        const currIsPunctuation = isPunctuation(curr.text)
        const nextIsPunctuation = next && isPunctuation(next.text)

        if (!currIsPunctuation) {
            const length = nextIsPunctuation ? curr.text.length + 1 : curr.text.length
            timings.push({
                chars: {
                    start: text.length,
                    end: text.length + length,
                },
                time: curr.timing,
            })
        }

        text += curr.text

        if (next && !nextIsPunctuation) {
            text += ' '
        }
    }

    return {
        type: 'content',
        timings,
        text,
        editable,
    }
}

function createBlocks(words: Word[], { editable }: { editable: boolean }): Block[] {
    const paragraphs = words.reduce<Word[][]>((chunks, word, i) => {
        if (word.speaker || i === 0) {
            chunks.push([])
        }

        chunks[chunks.length - 1].push(word)
        return chunks
    }, [])

    return paragraphs.map(p => ({
        type: 'block',
        editable,
        children: [createContent(p, { editable })],
    }))
}

function splitTimings(timings: Timing[], time: number): [Timing[], Timing[], Timing[]] {
    let before: Timing[]
    let after: Timing[]
    let now: Timing[]

    const i = timings.findIndex(timing => timing.time.end >= time)

    if (i === -1) {
        before = timings.slice()
        now = after = []
    } else if (Range.contains(timings[i].time, time)) {
        before = timings.slice(0, i)
        now = [timings[i]]
        after = timings.slice(i + 1)
    } else {
        before = timings.slice(0, i)
        now = []
        after = timings.slice(i)
    }

    return [before, now, after]
}

function rangeForTimings(timings: Timing[], path: Path, attributes: { [key: string]: any } = {}): SlateRange {
    let startOffset = 0,
        endOffset = 0

    if (timings.length > 0) {
        startOffset = timings[0].chars.start
        endOffset = timings[timings.length - 1].chars.end
    }

    const anchor = { path, offset: startOffset }
    const focus = { path, offset: endOffset }
    return { anchor, focus, ...attributes }
}

function handleDecorate([node, path]: NodeEntry, currentTime: number): SlateRange[] {
    if (!Content.isContent(node)) {
        return []
    }

    const timings = node.timings
    if (timings[0].time.start > currentTime) {
        // Entire node is after current time
        return [
            rangeForTimings(timings, path, {
                timingHighlight: 'after',
            }),
        ]
    } else if (timings[timings.length - 1].time.end < currentTime) {
        // Entire node is before current time
        return [
            rangeForTimings(timings, path, {
                timingHighlight: 'before',
            }),
        ]
    } else {
        const [before, now, after] = splitTimings(timings, currentTime)
        const beforeRange = rangeForTimings(before, path, {
            timingHighlight: 'before',
        })
        const nowRange = rangeForTimings(now, path, {
            timingHighlight: 'now',
        })
        const afterRange = rangeForTimings(after, path, {
            timingHighlight: 'after',
        })

        return [beforeRange, nowRange, afterRange]
    }
}

/**
 * Get the Slate Point (caret position) from the current selection
 * The current selection is preferably fetched from Slate's editor directly since it's the most performant (it's already calculated)
 * but in some cases, like read-only content (contenteditable=false), it can be null.
 * In these cases, we can get the caret position from the global window.getSelection() function call.
 *
 * @param editor
 */
function pointFromCurrentSelection(editor: ReactEditor): Point | null {
    if (editor.selection) {
        if (SlateRange.isCollapsed(editor.selection)) {
            return Editor.point(editor, editor.selection)
        } else {
            return null
        }
    } else {
        const domSelection = window.getSelection()
        if (!domSelection || !domSelection.isCollapsed || !domSelection.anchorNode) {
            return null
        }
        const caretPosition = ReactEditor.toSlatePoint(editor, [
            domSelection.anchorNode!,
            domSelection.anchorOffset,
        ])
        return caretPosition
    }
}

export const TextEditor = ({
    editor,
    task,
    currentTime,
    isAudioPlaying,
    onCursorTimeChange,
}: EditorProps) => {
    const nodes = useMemo<Node[]>(() => {
        const before = createBlocks(task.text.before, { editable: false })
        const editable = createBlocks(task.text.editable, { editable: true })
        const after = createBlocks(task.text.after, { editable: false })

        return [before, editable, after].flat()
    }, [task])

    const [value, setValue] = useState(nodes)
    const onChange = useCallback((newValue: Node[]) => {
        setValue(newValue)
    }, [])

    const onClick = useCallback(() => {
        const caretPosition = pointFromCurrentSelection(editor)
        if (!caretPosition) {
            return
        }
        const leafEntry = Editor.leaf(editor, caretPosition)
        const leaf = leafEntry[0]
        const offset = caretPosition.offset
        if (Content.isContent(leaf)) {
            const timings = leaf.timings
            const i = timings.findIndex(timing => timing.chars.end >= offset)
            if (i === -1) {
                console.assert(
                    'ERROR: Selection was made but the leaf does not have the relevant Timing entry',
                )
            } else if (Range.contains(timings[i].chars, offset)) {
                // Note: if we report the exactly start time of the word, it can select the previous word, so we add a small amount of time
                onCursorTimeChange && onCursorTimeChange(timings[i].time.start + 0.01)
            } else {
                console.log('after?')
            }
        }
    }, [editor, onCursorTimeChange])

    const renderElement = useCallback(props => <BlockView {...props} />, [])
    // if renderLeaf is wrapped with useCallback, leaves are not re-rendered on decoration changes
    // See https://github.com/ianstormtaylor/slate/issues/3447
    const renderLeaf = (props: any) => <ContentView highlightCurrent={isAudioPlaying} {...props} />
    const decorate = useCallback(entry => handleDecorate(entry, currentTime), [currentTime])

    return (
        <Slate editor={editor} value={value} onChange={onChange}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                decorate={decorate}
                spellCheck={false}
                onClick={onClick}
                style={{
                    position: 'relative',
                    minHeight: '100%',
                }}
            />
        </Slate>
    )
}
