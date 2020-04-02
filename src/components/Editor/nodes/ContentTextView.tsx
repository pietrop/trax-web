import React from 'react'
import styled from 'styled-components/macro'
import { ContentText } from '../Editor'

interface TextProps {
    editable: boolean
    unclear: boolean
    highlight: 'before' | 'now' | 'after'
    highlightCurrent: boolean
    type: string
}

function getTextColor({ editable, unclear, highlight }: TextProps) {
    return editable || unclear ? 'rgb(34,34,34)' : 'rgb(142,143,144)'

    if (highlight === 'after') {
        return editable ? 'rgb(100,100,100)' : 'rgb(142,143,144)'
    } else {
        return editable ? 'rgb(34,34,34)' : 'rgb(98,99,99)'
    }
}

const Text = styled.span<TextProps>`
    color: ${getTextColor};
    ${props => props.highlight === 'now' && props.highlightCurrent && `background-color: rgb(255,255,176);`}
    ${props =>
        props.type === 'unclear' &&
        `
        background-color: rgb(229, 238, 251);
        border-radius: 3px;
        padding: 1px 0px;
        &:before {
            content: '?';
            padding: 0 4px;
            opacity: 0.5;
        }
        &:after {
            content: '?';
            padding: 0 4px;
            opacity: 0.5;
        }
    `}
`

interface ContentTextViewProps {
    leaf: ContentText
    attributes: any
    children: string
    highlightCurrent: boolean
}

export const ContentTextView = ({ leaf, attributes, children, highlightCurrent }: ContentTextViewProps) => {
    return (
        <Text
            {...attributes}
            type={leaf.type}
            highlight={leaf.timingHighlight ?? 'after'}
            highlightCurrent={highlightCurrent}
            editable={leaf.editable}
            // @ts-ignore
            unclear={leaf.type === 'unclear'}>
            {children}
        </Text>
    )
}
