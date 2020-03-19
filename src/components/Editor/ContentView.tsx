import React from 'react'
import styled from 'styled-components/macro'
import { Content } from './Editor'

interface TextProps {
    editable: boolean
    highlight: 'before' | 'now' | 'after'
    highlightCurrent: boolean
}

function getTextColor({ editable, highlight }: TextProps) {
    if (highlight === 'after') {
        return editable ? 'rgb(100,100,100)' : 'rgb(142,143,144)'
    } else {
        return editable ? 'rgb(34,34,34)' : 'rgb(98,99,99)'
    }
}

const Text = styled.span<TextProps>`
    color: ${getTextColor};
    ${props => props.highlight === 'now' && props.highlightCurrent && `background-color: rgb(255,255,176);`}
`

interface ContentViewProps {
    leaf: Content
    attributes: any
    children: string
    highlightCurrent: boolean
}

export const ContentView = ({ leaf, attributes, children, highlightCurrent }: ContentViewProps) => {
    return (
        <Text
            {...attributes}
            highlight={leaf.timingHighlight ?? 'after'}
            highlightCurrent={highlightCurrent}
            editable={leaf.editable}>
            {children}
        </Text>
    )
}
