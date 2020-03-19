import React, { useCallback, useReducer, useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components/macro'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { TransportLayer } from 'src/network'
import { Task } from 'src/models'
import { AudioPlayer } from 'src/components/AudioPlayer'
import { GlossaryPanel } from 'src/components/GlossaryPanel'
import { TaskEditor } from './TaskEditor'

type Idle = {
    state: 'idle'
}

type InProgress = {
    state: 'inprogress'
    task: Task
}

type State = Idle | InProgress

type Action = { type: 'request-task' } | { type: 'set-task'; task: Task } | { type: 'publish-task' }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'set-task':
            return {
                state: 'inprogress',
                task: action.task,
            }
    }

    return { state: 'idle' }
}

async function requestNewTask(transport: TransportLayer, dispatch: React.Dispatch<Action>) {
    dispatch({ type: 'request-task' })
    const task = await transport.requestNewTask()
    dispatch({ type: 'set-task', task })
    return task
}

const Container = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    height: calc(100% - 55px);
`

const TopPane = styled.div`
    display: flex;
    flex: 1;
    height: calc(100% - 46px);
`

const BottomPane = styled.div`
    height: 46px;
`

const SessionPanel = styled.div`
    position: relative;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
`

const RightSidebar = styled.aside`
    min-width: 200px;
    max-width: 250px;
    background-color: white;
    border-left: 1px solid #e1e4e8;
`

const PublishButton = styled.div`
    position: absolute;
    bottom: 40px;
    right: 30px;
    letter-spacing: 0.3px;
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

    &:active {
        transform: scale(1.03);
    }
`

interface SessionProps {
    transport: TransportLayer
}

export const Session = ({ transport }: SessionProps) => {
    const editor = useMemo(() => withReact(createEditor()), [])

    const [session, dispatch] = useReducer(reducer, { state: 'idle' })
    const audio = '/samples/1525310/1525310.wav'
    const audioTiming =
        session.state === 'inprogress'
            ? {
                  start: session.task.text.before[0].timing.start,
                  end: session.task.text.after[session.task.text.after.length - 1].timing.end,
              }
            : { start: 0, end: 0 }
    const [currentTime, setCurrentTime] = useState(audioTiming.start)
    const [isAudioPlaying, setIsAudioPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const onCursorTimeChange = useCallback((cursorTime: number) => {
        audioRef.current!.currentTime = cursorTime
    }, [])

    const fetchTask = async () => {
        const task = await requestNewTask(transport, dispatch)
        if (audioRef.current) {
            audioRef.current.currentTime = task.timing.editable.start + 0.0001
        }
    }

    useEffect(() => {
        fetchTask()
    }, [])

    return (
        <Container>
            <TopPane>
                <SessionPanel>
                    {session.state === 'inprogress' && (
                        <TaskEditor
                            editor={editor}
                            task={session.task}
                            currentTime={currentTime}
                            isAudioPlaying={isAudioPlaying}
                            onCursorTimeChange={onCursorTimeChange}
                        />
                    )}
                    <PublishButton onClick={() => fetchTask()}>Publish</PublishButton>
                </SessionPanel>
                <RightSidebar>
                    <GlossaryPanel transport={transport} editor={editor} />
                </RightSidebar>
            </TopPane>
            <BottomPane>
                {session.state === 'inprogress' && (
                    <AudioPlayer
                        src={audio}
                        task={session.task}
                        onTogglePlay={setIsAudioPlaying}
                        onTimeUpdate={setCurrentTime}
                        audioRef={audioRef}
                    />
                )}
            </BottomPane>
        </Container>
    )
}
