import React from 'react'
import styled from 'styled-components/macro'
import { Block } from '../Editor'

const Container = styled.div`
    display: flex;
    outline: none;
    margin: 16px 0;
    align-items: flex-start;
    justify-content: flex-start;

    &:first-of-type {
        margin: 0;
    }
`

interface BlockViewProps {
    element: Block
    attributes: any
    children: any
}

export const BlockView = ({ element, attributes, children }: BlockViewProps) => {
    return <Container {...attributes}>{children}</Container>
}
