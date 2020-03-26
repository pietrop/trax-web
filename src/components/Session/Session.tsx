import React, { useCallback, useReducer, useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components/macro'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { TransportLayer } from 'src/network'
import { Task, SessionStatus, WorkerId } from 'src/models'
import { AudioPlayer } from 'src/components/AudioPlayer'
import { GlossaryPanel } from 'src/components/GlossaryPanel'
import { TaskEditor } from './TaskEditor'

interface InitialState {
    state: 'initial'
}

interface FetchingSessionStatus {
    state: 'fetching-session-status'
}

interface IdleSessionState {
    state: 'idle'
    status: SessionStatus
}

interface TaskInProgressState {
    state: 'inprogress'
    task: Task
    status: SessionStatus
}

interface PublishingTaskState {
    state: 'publishing'
    status: SessionStatus
}

type State =
    | InitialState
    | FetchingSessionStatus
    | IdleSessionState
    | TaskInProgressState
    | PublishingTaskState

type Action =
    | { type: 'fetch-session-status' }
    | { type: 'set-session-status'; status: SessionStatus }
    | { type: 'request-task' }
    | { type: 'set-task'; task: Task }
    | { type: 'publish-task' }
    | { type: 'task-published' }

function reducer(state: State, action: Action): State {
    switch (state.state) {
        case 'initial':
            switch (action.type) {
                case 'fetch-session-status':
                    return { state: 'fetching-session-status' }
                default:
                    return state
            }

        case 'fetching-session-status':
            switch (action.type) {
                case 'set-session-status':
                    return { state: 'idle', status: action.status }
                default:
                    return state
            }

        case 'idle':
        case 'inprogress':
        case 'publishing':
            switch (action.type) {
                case 'set-task':
                    return {
                        ...state,
                        state: 'inprogress',
                        task: action.task,
                    }
                case 'publish-task':
                    return {
                        ...state,
                        state: 'publishing',
                    }
                default:
                    return state
            }
    }
}

async function getSessionStatus(transport: TransportLayer, dispatch: React.Dispatch<Action>) {
    dispatch({ type: 'fetch-session-status' })
    const workerId = await transport.authenticate()
    const status = await transport.getSessionStatus(workerId)
    dispatch({ type: 'set-session-status', status })
}

async function publishTask(
    task: Task,
    transport: TransportLayer,
    dispatch: React.Dispatch<Action>,
    workerId: WorkerId,
) {
    dispatch({ type: 'publish-task' })
    await transport.publishTask(task, workerId)
    dispatch({ type: 'task-published' })
}

async function requestNewTask(
    transport: TransportLayer,
    dispatch: React.Dispatch<Action>,
    workerId: WorkerId,
) {
    dispatch({ type: 'request-task' })
    const task = await transport.requestNewTask(workerId)
    dispatch({ type: 'set-task', task })
    return task
}

async function requestNewTaskAndSetAudioTime(
    transport: TransportLayer,
    dispatch: React.Dispatch<Action>,
    workerId: WorkerId,
    audioEl: HTMLAudioElement | null,
) {
    const task = await requestNewTask(transport, dispatch, workerId)
    if (audioEl) {
        audioEl.currentTime = task.text.editable.timing.start + 0.0001
    }
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
    z-index: 2;
`

const SessionPanel = styled.div`
    position: relative;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
`

const ScrollingWrapper = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    max-height: 100%;
    overflow-y: auto;

    &:after {
        display: block;
        width: 100%;
        height: 50px;
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        pointer-events: none;
        background: linear-gradient(180deg, transparent 0%, rgba(246, 248, 250, 1) 75%);
    }
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
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const audioRef = useRef<HTMLAudioElement>(null)

    const [session, dispatch] = useReducer(reducer, { state: 'initial' })
    // Authenticate and get session status only once
    useEffect(() => {
        getSessionStatus(transport, dispatch)
    }, [])

    // Request a new task if the session is ready (idle)
    useEffect(() => {
        if (session.state === 'idle') {
            requestNewTaskAndSetAudioTime(transport, dispatch, session.status.workerId, audioRef.current)
        }
    }, [session.state, audioRef.current])

    const audioTiming = session.state === 'inprogress' ? session.task.timing : { start: 0, end: 0 }
    const [currentTime, setCurrentTime] = useState(audioTiming.start)
    const [isAudioPlaying, setIsAudioPlaying] = useState(false)

    const onCursorTimeChange = useCallback((cursorTime: number) => {
        audioRef.current!.currentTime = cursorTime
    }, [])

    const handlePublish = async () => {
        if (session.state !== 'inprogress') {
            return
        }

        // const [editableNode] = Editor.node(editor, [1])
        // console.log('leaf', Node.leaf(editableNode, [0]))
        // console.log(editableNode)

        await publishTask(session.task, transport, dispatch, session.status.workerId)
        requestNewTaskAndSetAudioTime(transport, dispatch, session.status.workerId, audioRef.current)
    }

    return (
        <Container>
            <TopPane>
                <SessionPanel>
                    <ScrollingWrapper>
                        {session.state === 'inprogress' && (
                            <TaskEditor
                                editor={editor}
                                task={session.task}
                                currentTime={currentTime}
                                isAudioPlaying={isAudioPlaying}
                                onCursorTimeChange={onCursorTimeChange}
                            />
                        )}
                    </ScrollingWrapper>
                    <PublishButton onClick={handlePublish}>Publish</PublishButton>
                </SessionPanel>
                <RightSidebar>
                    <GlossaryPanel transport={transport} editor={editor} />
                </RightSidebar>
            </TopPane>
            <BottomPane>
                {session.state === 'inprogress' && (
                    <AudioPlayer
                        src={session.status.audioUrl}
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
