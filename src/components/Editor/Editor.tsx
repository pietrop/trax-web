import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Editor, Element, Node, NodeEntry, Path, Point, Range as SlateRange, Text, Transforms } from 'slate'
import { Editable, ReactEditor, Slate, RenderElementProps } from 'slate-react'
import { Task, Word, GlossaryTerm, Segment } from 'src/models'
import { Range } from 'src/utils/range'
import { isPunctuation } from 'src/utils/text'
import { BlockView } from './nodes/BlockView'
import { SpeakerBoxView } from './nodes/SpeakerBoxView'
import { ContentView } from './nodes/ContentView'
import { ContentTextView } from './nodes/ContentTextView'
import { UnclearView } from './nodes/UnclearView'

/**
 * Types of tags:
 *  Void:
 *      Inaudible
 *      Laughter
 *  Text:
 *      Glossary
 *
 */

interface Tag {
    type: 'text' | 'void'
    name: string
}

interface GlossTermTag {
    type: 'text'
    term: GlossaryTerm
}

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
    speaker: string | null
    editable: boolean
    timings: Timing[]
    children: [SpeakerBox, Content]
}

export interface SpeakerBox extends Element {
    type: 'speakerbox'
    speaker: string | null
    availableSpeakers: string[]
    duration: number
}

export interface Content extends Element {
    type: 'content'
    editable: boolean
    children: ContentText[]
}

export interface ContentText extends Text {
    type: 'text'
    editable: boolean
    text: string
    timingHighlight?: 'before' | 'now' | 'after'
    unclear: boolean
}

export const Block = {
    isBlock: (value: any): value is Block => {
        return value['type'] === 'block'
    },
}

export const Content = {
    isContent: (value: any): value is Content => {
        return value['type'] === 'content'
    },
}

function createContent(words: Word[], { editable }: { editable: boolean }): [Content, Timing[]] {
    let text = ''
    let timings: Timing[] = []

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

    return [
        {
            type: 'content',
            editable,
            children: [
                {
                    type: 'text',
                    text,
                    editable,
                    unclear: false,
                },
            ],
        },
        timings,
    ]
}

function createSpeakerBox(speaker: string | null, duration: number): SpeakerBox {
    return {
        type: 'speakerbox',
        speaker,
        availableSpeakers: [],
        duration,
        children: [{ text: '' }],
    }
}

function createBlocks(segment: Segment, { editable }: { editable: boolean }): Block[] {
    const paragraphs = segment.words.reduce<Word[][]>((chunks, word, i) => {
        if (word.speaker || i === 0) {
            chunks.push([])
        }

        chunks[chunks.length - 1].push(word)
        return chunks
    }, [])

    return paragraphs.map((p) => {
        const [content, timings] = createContent(p, { editable })
        const speakerBox = createSpeakerBox(segment.speaker, segment.timing.end - segment.timing.start)

        return {
            type: 'block',
            speaker: segment.speaker,
            editable,
            timings,
            children: [speakerBox, content],
        }
    })
}

function splitTimingsBasedOnOffset(timings: Timing[], offset: number): [Timing[], Timing[], Timing[]] {
    let before: Timing[]
    let after: Timing[]
    let now: Timing[]

    const i = timings.findIndex((timing) => timing.chars.end >= offset)

    if (i === -1) {
        before = timings.slice()
        now = after = []
    } else if (Range.contains(timings[i].chars, offset)) {
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

function splitTimings(timings: Timing[], time: number): [Timing[], Timing[], Timing[]] {
    let before: Timing[]
    let after: Timing[]
    let now: Timing[]

    const i = timings.findIndex((timing) => timing.time.end >= time)

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

function handleDecorate(editor: Editor, [node, path]: NodeEntry, currentTime: number): SlateRange[] {
    if (!Content.isContent(node)) {
        return []
    }
    const [block] = Editor.parent(editor, path)
    if (!Block.isBlock(block)) {
        console.assert(
            false,
            'Found a Content node that has no Block parent while decorating. This is a logic error.',
        )
        return []
    }

    const timings = block.timings
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

    const onClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!(e.target instanceof HTMLElement)) {
                return
            }

            // Only clicks on Content elements or their descendants
            const node = ReactEditor.toSlateNode(editor, e.target)
            const path = ReactEditor.findPath(editor, node)
            if (
                Array.from(Editor.nodes(editor, { at: path, match: (n) => Content.isContent(n) })).length ===
                0
            ) {
                console.log("Clicked on node that has no Content ancestor. This won't seek audio.")
                return
            }

            const caretPosition = pointFromCurrentSelection(editor)
            if (!caretPosition) {
                return
            }
            const [block] = Editor.node(editor, caretPosition, { depth: 1 })
            const offset = caretPosition.offset

            if (Block.isBlock(block)) {
                const timings = block.timings
                const i = timings.findIndex((timing) => timing.chars.end >= offset)
                if (i === -1) {
                    console.assert(
                        'ERROR: Selection was made but the block does not have the relevant Timing entry',
                    )
                } else if (Range.contains(timings[i].chars, offset)) {
                    // Note: if we report the exactly start time of the word, it can select the previous word, so we add a small amount of time
                    onCursorTimeChange && onCursorTimeChange(timings[i].time.start + 0.01)
                } else {
                    console.log('after?')
                }
            }
        },
        [editor, onCursorTimeChange],
    )

    // @ts-ignore
    window.editor = editor

    useEffect(() => {
        const apply = editor.apply
        editor.apply = (op) => {
            if (op.type === 'insert_text') {
                const [block] = Editor.node(editor, op.path, { depth: 1 })

                if (Block.isBlock(block)) {
                    // let [before, now, after] = splitTimingsBasedOnOffset(block.timings, op.offset)

                    // if (op.text === ' ') {
                    //     for (let i = 0; i < after.length; i++) {
                    //         debugger
                    //         after[i].chars.start = after[i].chars.start + 1
                    //     }
                    //     if (now.length > 0) {
                    //         // Split the now word
                    //         if (op.offset < now[0].chars.end) {
                    //             const newTiming = {
                    //                 chars: { start: op.offset + 1 },
                    //             }
                    //         }
                    //     }
                    // }
                    const i = block.timings.findIndex((timing) => Range.contains(timing.chars, op.offset))
                    console.log(i)
                    console.log(block.timings[i])
                    console.log(op)
                }
            }
            apply(op)
        }

        const isVoid = editor.isVoid
        editor.isVoid = (element) => {
            if (element.type === 'speakerbox') {
                return true
            }

            return isVoid(element)
        }

        const normalizeNode = editor.normalizeNode
        editor.normalizeNode = (entry) => {
            const [node, path] = entry

            if (Block.isBlock(node)) {
                const [speakerBox] = node.children
                const contentNodeEntries = Array.from(
                    Editor.nodes(editor, {
                        at: path,
                        match: (child) => Content.isContent(child),
                    }),
                )

                if (contentNodeEntries.length > 1) {
                    const [firstContent] = contentNodeEntries[0]
                    const firstText = Node.string(firstContent)
                    const words = firstText.split(' ')
                    const firstTimings = node.timings.slice(0, words.length)
                    const secondTimings = node.timings.slice(words.length, node.timings.length)

                    // Set split timings for first node
                    Transforms.setNodes(editor, { timings: firstTimings }, { at: path })

                    // Insert second node
                    const newBlockPath = Path.next(path)
                    Transforms.insertNodes(
                        editor,
                        {
                            ...node,
                            timings: secondTimings,
                            children: [{ ...speakerBox }],
                        },
                        { at: newBlockPath },
                    )

                    // Move second content node to new block node
                    Transforms.moveNodes(editor, {
                        at: contentNodeEntries[1][1],
                        to: newBlockPath.concat(1),
                    })

                    return
                }
            }

            normalizeNode(entry)
        }
    }, [editor])

    const renderElement = useCallback((props) => {
        switch (props.element.type) {
            case 'block':
                return <BlockView {...props} />
            case 'content':
                return <ContentView {...props} />
            case 'speakerbox':
                return <SpeakerBoxView {...props} />
            case 'unclear':
                return <UnclearView {...props} />
            default:
                throw new Error(
                    `Unsupported element type = ${props.element.type}, Element = ${props.element}`,
                )
        }
    }, [])
    // if renderLeaf is wrapped with useCallback, leaves are not re-rendered on decoration changes
    // See https://github.com/ianstormtaylor/slate/issues/3447
    const renderLeaf = (props: any) => <ContentTextView highlightCurrent={isAudioPlaying} {...props} />
    const decorate = useCallback((entry) => handleDecorate(editor, entry, currentTime), [currentTime, editor])

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
                    paddingBottom: 20,
                }}
            />
        </Slate>
    )
}
