import React from 'react'
import styled from 'styled-components/macro'
import { ReactEditor } from 'slate-react'
import { Task } from 'src/models'
import { TextEditor } from 'src/components/Editor'

const Page = styled.div`
    max-width: 750px;
    margin: 65px 80px;
    color: #222222;
    font-family: 'Literata', sans-serif;
    font-size: 18px;
    letter-spacing: 0.07px;
`

const Heading = styled.h2`
    font-family: 'Rubik', sans-serif;
    letter-spacing: 0.5px;
    font-weight: 600;
`

interface TaskProps {
    editor: ReactEditor
    task: Task
    currentTime: number
    isAudioPlaying: boolean
    onCursorTimeChange: (cursorTime: number) => void
}

export const TaskEditor = ({ editor, task, currentTime, isAudioPlaying, onCursorTimeChange }: TaskProps) => {
    return (
        <Page>
            <Heading>Transcribe the following:</Heading>
            <TextEditor
                editor={editor}
                task={task}
                currentTime={currentTime}
                isAudioPlaying={isAudioPlaying}
                onCursorTimeChange={onCursorTimeChange}
            />
        </Page>
    )
}
