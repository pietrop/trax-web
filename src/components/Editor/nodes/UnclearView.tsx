import React from 'react'
import styled from 'styled-components/macro'
import { Element } from 'slate'

const Container = styled.div`
    display: inline-block;
    background-color: rgb(229, 238, 251);
    border-radius: 3px;
    padding: 1px 0px;
    line-height: 150%;
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
`

interface UnclearViewProps {
    element: Element
    attributes: any
    children: any
}
export const UnclearView = ({ element, attributes, children }: UnclearViewProps) => {
    return <Container {...attributes}>{children}</Container>
}
