import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import { ReactEditor } from 'slate-react'
import { TransportLayer } from 'src/network'
import { Glossary, Term } from 'src/models'
import { Editor, Transforms } from 'slate'

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
    padding: 16px 0;
    border-bottom: 1px solid #e1e4e8;
    text-align: center;
    margin-bottom: 0;
`

const TermListScrollContainer = styled.div`
    overflow: auto;
    padding: 10px 20px 20px;
`

const TermItem = styled.div`
    padding: 12px 10px;
    color: #222222;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    border-bottom: 1px solid rgb(240, 240, 240);

    &:last-of-type {
        border-bottom: none;
    }

    &:hover {
        cursor: pointer;
        font-weight: 400;
        background-color: rgba(37, 210, 158, 0.15);
    }
`

interface GlossaryPanelProps {
    transport: TransportLayer
    editor: ReactEditor
}

export const GlossaryPanel = ({ transport, editor }: GlossaryPanelProps) => {
    const [glossary, setGlossary] = useState<Glossary | null>(null)

    useEffect(() => {
        transport.getGlossary().then(newGlossary => {
            setGlossary(newGlossary)
        })
    }, [])

    const onTermClick = useCallback(
        (term: Term) => {
            editor.insertText(term)
        },
        [editor],
    )

    return (
        <Container>
            <Heading>Glossary</Heading>
            <TermListScrollContainer>
                {glossary &&
                    glossary.terms.map((term, i) => (
                        <TermItem
                            onMouseDown={e => e.preventDefault()}
                            onClick={e => {
                                e.preventDefault()
                                onTermClick(term)
                            }}
                            key={i}>
                            {term}
                        </TermItem>
                    ))}
            </TermListScrollContainer>
        </Container>
    )
}
