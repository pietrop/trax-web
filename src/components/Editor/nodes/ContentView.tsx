import React from 'react'
import styled from 'styled-components/macro'
import { Content } from '../Editor'

const Common = styled.div`
    width: 100%;
    padding: 0px 16px 8px;
    outline: none;
    white-space: break-spaces;
    word-break: break-word;
    line-height: 150%;
`

const EditableContent = styled(Common)`
    padding-top: 8px;
    background: rgb(255, 255, 255);
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 4px solid;
    border-right: 4px solid;
    border-radius: 5px;
    border-color: rgba(37, 210, 158, 0.2) rgb(37, 210, 158);
`

const ReadOnlyContent = styled(Common)``

interface ContentViewProps {
    element: Content
    attributes: any
    children: any
}
export const ContentView = ({ element, attributes, children }: ContentViewProps) => {
    const Component = element.editable ? EditableContent : ReadOnlyContent

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
