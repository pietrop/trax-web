import React, { ReactNode } from 'react'
import styled from 'styled-components/macro'

const SegmentContainer = styled.div`
    display: flex;
`

const Paragraph = styled.p`
    flex: 1;
`

const SpeakerBox = styled.div`
    cursor: default;
    width: 100px;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: rgb(80, 80, 80);
    margin-top: 18px;
    margin-right: 20px;
    user-select: none;
`

interface SegmentProps {
    attributes: any
    children: ReactNode | ReactNode[]
}

export const Segment = ({ attributes, children }: SegmentProps) => {
    return (
        <SegmentContainer {...attributes}>
            <SpeakerBox contentEditable={false}>Speaker A&nbsp;&nbsp;🗣</SpeakerBox>
            <Paragraph>{children}</Paragraph>
        </SegmentContainer>
    )
}
