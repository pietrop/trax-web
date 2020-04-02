import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { MenuItem, Button } from '@blueprintjs/core'
import { Select, ItemRenderer, ItemPredicate } from '@blueprintjs/select'
import { SpeakerBox, Block } from '../Editor'
import { useEditor, ReactEditor } from 'slate-react'
import { Editor, Transforms, Path } from 'slate'

const SpeakerSelect = Select.ofType<string>()

const Container = styled.div`
    flex-shrink: 0;
    width: 150px;
    margin-top: 2px;
`

interface SpeakerBoxViewProps {
    element: SpeakerBox
    attributes: any
    children: any
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
}

function highlightText(text: string, query: string) {
    let lastIndex = 0
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars)
    if (words.length === 0) {
        return [text]
    }
    const regexp = new RegExp(words.join('|'), 'gi')
    const tokens: React.ReactNode[] = []
    while (true) {
        const match = regexp.exec(text)
        if (!match) {
            break
        }
        const length = match[0].length
        const before = text.slice(lastIndex, regexp.lastIndex - length)
        if (before.length > 0) {
            tokens.push(before)
        }
        lastIndex = regexp.lastIndex
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>)
    }
    const rest = text.slice(lastIndex)
    if (rest.length > 0) {
        tokens.push(rest)
    }
    return tokens
}

const renderSpeaker: ItemRenderer<string> = (speaker, { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
        return null
    }

    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={speaker}
            onClick={handleClick}
            text={highlightText(speaker, query)}
        />
    )
}

const renderCreateSpeaker = (
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>,
) => (
    <MenuItem
        icon="add"
        text={`Create "${query}"`}
        active={active}
        onClick={handleClick}
        shouldDismissPopover={false}
    />
)

const filterSpeaker: ItemPredicate<string> = (query, speaker, i, exactMatch) => {
    const normalizedSpeaker = speaker.toLowerCase()
    const normalizedQuery = query.toLowerCase()

    if (exactMatch) {
        return normalizedSpeaker === normalizedQuery
    } else {
        return normalizedSpeaker.indexOf(normalizedQuery) >= 0
    }
}

function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds}`
}

const Label = styled.div`
    font-family: 'Inter', sans-serif;
    color: rgb(100, 100, 100);
`

const SpeakerLabel = styled(Label)`
    font-size: 9px;
    font-weight: 500;
    margin-bottom: 4px;
`

const DurationLabel = styled(Label)`
    font-size: 11px;
    font-weight: 400;
    margin-top: 8px;
`

export const SpeakerBoxView = ({ element, attributes, children }: SpeakerBoxViewProps) => {
    const editor = useEditor()
    const speakers = element.availableSpeakers
    const handleSpeakerSelection = useCallback(
        (speaker: string) => {
            const path = ReactEditor.findPath(editor, element)
            const blockPath = Path.parent(path)

            const isNewlyCreatedItem = !speakers.includes(speaker)
            if (isNewlyCreatedItem) {
                Transforms.setNodes(
                    editor,
                    { availableSpeakers: speakers.concat(speaker) },
                    { at: [], match: n => n.type === 'speakerbox' },
                )
            }
            Transforms.setNodes(editor, { speaker }, { at: blockPath })
            Transforms.setNodes(editor, { speaker }, { at: path })
        },
        [editor, speakers],
    )

    return (
        <Container {...attributes} contentEditable={false}>
            <SpeakerSelect
                items={speakers}
                onItemSelect={handleSpeakerSelection}
                itemRenderer={renderSpeaker}
                itemPredicate={filterSpeaker}
                createNewItemFromQuery={item => item}
                createNewItemRenderer={renderCreateSpeaker}
                popoverProps={{
                    position: 'bottom' as 'bottom',
                    modifiers: {
                        flip: { enabled: false },
                    },
                }}>
                <Button icon="person" rightIcon="caret-down" text={element.speaker ?? '       '} />
            </SpeakerSelect>
            <DurationLabel>Duration: {formatDuration(element.duration)}</DurationLabel>
            {children}
        </Container>
    )
}
