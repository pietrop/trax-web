import React, { useState, useEffect, useCallback, Fragment } from 'react'
import styled from 'styled-components/macro'
import { ReactEditor } from 'slate-react'
import { TransportLayer } from 'src/network'
import { Glossary, GlossaryTerm, TermRequestBody } from 'src/models'
import { InputGroup, Button, Popover, Label, Classes } from '@blueprintjs/core'
import { isEmpty, find, update, get, map } from 'lodash'
import Fuse from 'fuse.js'

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
    height: 70px;
    padding: 12px 10px;
    border-bottom: 1px solid rgb(240, 240, 240);
    position: relative;

    &:last-of-type {
        border-bottom: none;
    }

    &:hover {
        cursor: pointer;
        font-weight: 400;
        background-color: rgba(37, 210, 158, 0.15);
    }
`

const TermItemTooltip = styled.div`
    visibility: hidden;
    position: absolute;
    width: 190px;
    background-color: rgb(53, 60, 68);
    color: #fff;
    border-radius: 6px;
    z-index: 1;
    border-radius: 6px;
    z-index: 1;
    top: 30px;
    padding: 10px;
    opacity: 0;
    transition: opacity 1s;

    ${TermItem}:hover & {
        visibility: visible;
        opacity: 1;
    }

    &::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent rgb(53, 60, 68) transparent;
    }
`

const TermItemText = styled.p`
    margin-bottom: 5px;
    color: #222222;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
`

const TermItemComment = styled.p`
    color: rgb(142, 143, 144);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 200;
    max-width: 240px;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

const AddTermContainer = styled.div`
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    padding: 15px;
`

const PopoverTermContainer = styled.div`
    text-align: center;
    max-width: 250px;
    margin-top: 5px;
`

const AddTermSaveButton = styled.div`
    font-size: 14px;
    font-weight: 500;
    font-family: Inter;
    color: white;
    cursor: pointer;
    padding: 8px 24px;
    background-color: rgb(21, 206, 150);
    box-shadow: 0px 0px 10px 1px #c3c3c3;
    border-radius: 15px;
    transition: all 180ms ease-out;
    user-select: none;
    width: 82px;
    margin: 0 auto;

    &:active {
        transform: scale(1.03);
    }
`

const InputGroupWrapper = styled(InputGroup)`
    margin-bottom: 5px;
`

const AddTermButtonWrapper = styled(Button)`
    max-width: 240px;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

interface GlossaryPanelProps {
    transport: TransportLayer
    editor: ReactEditor
}

export const GlossaryPanel = ({ transport, editor }: GlossaryPanelProps) => {
    const [glossary, setGlossary] = useState<Glossary>({ terms: [] })
    const [searchTerm, setSearchTerm] = useState<string | null>(null)
    const [glossaryTerm, setGlossaryTerm] = useState<TermRequestBody>({
        text: '',
        fields: {
            comment: null,
            url: null,
        },
    })

    useEffect(() => {
        transport.getGlossary().then((newGlossary) => {
            setGlossary(newGlossary)
        })
    }, [])

    const fuseSearchOptions = {
        includeScore: true,
        keys: ['text'],
    }

    const fuse = new Fuse(glossary.terms, fuseSearchOptions)

    const onTermClick = useCallback(
        (term: GlossaryTerm) => {
            editor.insertText(term.text)
        },
        [editor],
    )

    const onSaveTermClick = () => {
        transport.addGlossaryTerm(glossaryTerm).then((newGlossaryTerm) => {
            const newGlossary = get(glossary, 'terms', []) as any
            newGlossary.push(newGlossaryTerm)
            setGlossary({ terms: newGlossary })
        })
    }

    const showAddGlossaryTerm = () =>
        !isEmpty(searchTerm) && glossary && !find(glossary.terms, ['text', searchTerm])

    const setTermFieldsValue = (key: string, value: string) => {
        setGlossaryTerm(update(glossaryTerm, key, () => value))
    }

    const highlightSearchResult = (text: string): any => {
        if (searchTerm === null || searchTerm === '') {
            return <TermItemText>{text}</TermItemText>
        }

        const withHighlight = map(text.split(''), (letter) => {
            return searchTerm.includes(letter) ? <b>{letter}</b> : letter
        })
        return <TermItemText>{withHighlight}</TermItemText>
    }

    let items: GlossaryTerm[] = []
    if (glossary) {
        if (searchTerm === null || searchTerm === '') {
            items = glossary.terms
        } else {
            items = map(fuse.search(searchTerm), 'item')
        }
    }

    return (
        <Container>
            <Heading>Glossary</Heading>
            <InputGroup
                leftIcon="search"
                onChange={(e: any) => {
                    setSearchTerm(e.target.value)
                    setTermFieldsValue('text', e.target.value)
                }}
                placeholder="Search terms"
                value={searchTerm ?? ''}
            />
            {showAddGlossaryTerm() && (
                <PopoverTermContainer>
                    <Popover position="bottom">
                        <AddTermButtonWrapper icon="plus" outlined>
                            {' '}
                            Add term: '{searchTerm}'{' '}
                        </AddTermButtonWrapper>
                        <AddTermContainer>
                            <Label>
                                Comment:
                                <InputGroupWrapper
                                    placeholder="Optional"
                                    name="fields.comment"
                                    onChange={(e: any) => setTermFieldsValue(e.target.name, e.target.value)}
                                />
                            </Label>
                            <Label>
                                Url:
                                <InputGroupWrapper
                                    placeholder="Optional"
                                    name="fields.url"
                                    onChange={(e: any) => setTermFieldsValue(e.target.name, e.target.value)}
                                />
                            </Label>
                            <AddTermSaveButton
                                className={Classes.POPOVER_DISMISS}
                                onClick={() => onSaveTermClick()}>
                                Save
                            </AddTermSaveButton>
                        </AddTermContainer>
                    </Popover>
                </PopoverTermContainer>
            )}

            <TermListScrollContainer>
                {glossary &&
                    items.map((term, i) => (
                        <TermItem
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                                e.preventDefault()
                                onTermClick(term)
                            }}
                            key={`glossary-term-${i}`}>
                            {highlightSearchResult(term.text)}
                            {!isEmpty(term.fields.comment) && (
                                <React.Fragment>
                                    <TermItemComment>
                                        {'Note: '}
                                        {term.fields.comment}
                                    </TermItemComment>
                                    <TermItemTooltip>
                                        {'Note: '}
                                        {term.fields.comment}
                                    </TermItemTooltip>
                                </React.Fragment>
                            )}
                        </TermItem>
                    ))}
            </TermListScrollContainer>
        </Container>
    )
}
