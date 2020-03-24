import React from 'react'
import styled from 'styled-components/macro'
import { Block, Content } from './Editor'

const CommonBlock = styled.div`
    padding: 12px 20px;
    margin: 16px 0;
    outline: none;
    white-space: break-spaces;
    word-break: break-word;

    &:first-of-type {
        margin: 0;
    }
`

const EditableBlock = styled(CommonBlock)`
    background: rgb(255, 255, 255);
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 4px solid;
    border-right: 4px solid;
    border-radius: 5px;
    border-color: rgba(37, 210, 158, 0.2) rgb(37, 210, 158);
`
const ReadOnlyBlock = styled(CommonBlock)``

interface BlockViewProps {
    element: Block
    attributes: any
    children: Content[]
}
export const BlockView = ({ element, attributes, children }: BlockViewProps) => {
    const Component = element.editable ? EditableBlock : ReadOnlyBlock

    return (
        <Component
            {...attributes}
            contentEditable={element.editable}
            suppressContentEditableWarning={true}
            // If the block is Readonly (contentEditable=false), it is not focusable by default
            // and hence breaks the selection logic for the onClick mouse event on Editable.
            // Setting tabIndex to 1 means the browser treats it as focusable and reachable via tab press.
            // Setting tabIndex to -1 means the browser treats it as focusable but not reachable via tab press (which is desirable behavior for Read-only blocks)
            tabIndex={element.editable ? 1 : -1}>
            {children}
        </Component>
    )
}
