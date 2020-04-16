import React from 'react'
import { Popover, Button } from '@blueprintjs/core'
import styled from 'styled-components/macro'
import { Attachment } from 'src/models/attachment'

const Container = styled.div`
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: rgb(255, 255, 255);
    box-sizing: border-box;
`

const Heading = styled.h2`
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    color: #394b59;
    padding: 0px 0px 12px;
    border-bottom: 1px solid #e1e4e8;
    text-align: center;
    margin-bottom: 0;
`

const PopoverContainer = styled.div`
    padding: 20px 10px 10px 10px;
`

const AttachmentRow = styled.p`
    margin-bottom: 5px;
    font-family: 'Inter', sans-serif;
`

interface AttachmentsPanelProps {
    attachments: Attachment[]
}

export const AttachmentsPanel = ({ attachments }: AttachmentsPanelProps) => {
    return (
        <Container>
            <Heading>
                Attachments
                {attachments && (
                    <Popover position="bottom">
                        <Button icon="list" minimal />
                        <PopoverContainer>
                            {attachments.map((attachment, i) => (
                                <AttachmentRow key={`attachment-${i}`}>
                                    {`${i + 1}) `}
                                    <a href={attachment.url} target="_blank">
                                        {`${attachment.name}`}
                                    </a>
                                </AttachmentRow>
                            ))}
                        </PopoverContainer>
                    </Popover>
                )}
            </Heading>
        </Container>
    )
}
