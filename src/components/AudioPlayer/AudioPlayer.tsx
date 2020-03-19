import React, {
    useState,
    useCallback,
    useMemo,
    ButtonHTMLAttributes,
    useEffect,
    useRef,
    useLayoutEffect,
} from 'react'
import styled from 'styled-components/macro'
import { ifProp } from 'styled-tools'
import { Range } from 'src/utils/range'
import { Task } from 'src/models'
import { PlayIconSVG, PauseIconSVG, PrevIconSVG, NextIconSVG, VolumeIconLoudSVG } from './icons'

const Strip = styled.div`
    display: flex;
    width: 100%;
    height: 45px;
    border-top: 1px solid #e1e4e8;
`

const Button = styled.button`
    appearance: none;
    outline: none;
    border: none;
    cursor: ${ifProp('disabled', 'default', 'pointer')};
    background-color: transparent;
`

const AudioPlayerButton = styled(Button)`
    display: flex;
    width: 50px;
    justify-content: center;
    align-items: center;
    fill: currentColor;
    color: rgb(60, 60, 60);
`

const BackwardButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <AudioPlayerButton {...props}>
        <PrevIconSVG width={13} />
    </AudioPlayerButton>
)

const ForwardButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <AudioPlayerButton {...props}>
        <NextIconSVG width={13} />
    </AudioPlayerButton>
)

const VolumeButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <AudioPlayerButton {...props}>
        <VolumeIconLoudSVG width={15} />
    </AudioPlayerButton>
)

interface PlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    playing: boolean
}

const PlayButton = ({ playing, ...rest }: PlayButtonProps) => {
    const icon = playing ? <PauseIconSVG width={16} /> : <PlayIconSVG width={16} />
    return <AudioPlayerButton {...rest}>{icon}</AudioPlayerButton>
}

const PlaybackControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
`

const TrackWrapper = styled.div`
    display: flex;
    flex: 1;
    height: 100%;
    position: relative;
    border-left: 1px solid #e1e4e8;
    border-right: 1px solid #e1e4e8;
`

const TrackPlayProgress = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    background-color: rgba(30, 30, 30, 0.2);
    transform-origin: 0 0;
`

interface AudioSegment {
    color: string
    timing: Range
}

interface AudioTrackProps {
    duration: number
    currentTime: number
    activeSegment: AudioSegment
    onTrackTimeUpdate: (time: number) => void
}

function useBoundingClientRect(): [
    React.RefObject<HTMLDivElement>,
    { x: number; y: number; width: number; height: number },
] {
    const ref = useRef<HTMLDivElement>(null)
    const [rect, setRect] = useState(() => ({ x: 0, y: 0, width: 0, height: 0 }))

    useLayoutEffect(() => {
        if (ref.current) {
            setRect(ref.current.getBoundingClientRect())
        }
    }, [])

    return [ref, rect]
}

const AudioTrack = ({ duration, currentTime, activeSegment, onTrackTimeUpdate }: AudioTrackProps) => {
    const [mouseDown, setMouseDown] = useState(false)
    const [ref, rect] = useBoundingClientRect()

    const onMouseDown = useCallback(
        e => {
            setMouseDown(true)
            const x = e.pageX - rect.x
            const ratio = x / (rect.width - 1)
            onTrackTimeUpdate(ratio * duration)
        },
        [rect, duration, onTrackTimeUpdate],
    )

    const onMouseMove = useCallback(
        e => {
            if (mouseDown) {
                const x = e.pageX - rect.x
                const ratio = x / (rect.width - 1)
                onTrackTimeUpdate(ratio * duration)
            }
        },
        [rect, duration, mouseDown, onTrackTimeUpdate],
    )

    const onMouseUp = useCallback(() => {
        setMouseDown(false)
    }, [])

    return (
        <TrackWrapper ref={ref} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
            <div
                style={{
                    width: `${(activeSegment.timing.start / duration) * 100}%`,
                    backgroundImage:
                        'linear-gradient(45deg, #f5f5f5 25%, #f0f0f0 25%, #f0f0f0 50%, #f5f5f5 50%, #f5f5f5 75%, #f0f0f0 75%, #f0f0f0 100%)',
                    backgroundSize: '8.49px 8.49px',
                }}
            />
            <div
                style={{
                    width: `${((activeSegment.timing.end - activeSegment.timing.start) / duration) * 100}%`,
                    backgroundImage:
                        'linear-gradient(45deg, #d3f0e7 25%, #caede2 25%, #caede2 50%, #d3f0e7 50%, #d3f0e7 75%, #caede2 75%, #caede2 100%)',
                    backgroundSize: '8.49px 8.49px',
                }}
            />
            <div
                style={{
                    width: `${((duration - activeSegment.timing.end) / duration) * 100}%`,
                    backgroundImage:
                        'linear-gradient(45deg, #f5f5f5 25%, #f0f0f0 25%, #f0f0f0 50%, #f5f5f5 50%, #f5f5f5 75%, #f0f0f0 75%, #f0f0f0 100%)',
                    backgroundSize: '8.49px 8.49px',
                }}
            />
            <TrackPlayProgress
                style={{
                    transform: `scaleX(${Math.min(1.0, currentTime / duration)})`,
                }}
            />
        </TrackWrapper>
    )
}

interface AudioPlayerProps {
    src: string
    task: Task
    onTimeUpdate: (time: number) => void
    onTogglePlay: (playing: boolean) => void
    audioRef: React.RefObject<HTMLAudioElement>
}

const FORWARD_BACKWARD_JUMP_IN_SECONDS = 5

function seekTo(time: number, audio: HTMLAudioElement | null) {
    if (audio) {
        audio.currentTime = time
    }
}

function seekBy(amount: number, audio: HTMLAudioElement | null) {
    if (audio) {
        audio.currentTime += amount
    }
}

type AudioTimingInfo = {
    duration: number
    activeSegment: Range
}

function getAudioTimingInfo(task: Task): AudioTimingInfo {
    const start = task.text.before[0].timing.start
    const end = task.text.after[task.text.after.length - 1].timing.end
    return {
        duration: end - start,
        activeSegment: {
            start: task.timing.editable.start - start,
            end: task.timing.editable.end - start,
        },
    }
}

export const AudioPlayer = ({ src, task, onTimeUpdate, onTogglePlay, audioRef }: AudioPlayerProps) => {
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current
        if (!audio) {
            return
        }

        if (playing) {
            audio.pause()
        } else {
            audio.play()
        }

        setPlaying(!playing)
        onTogglePlay(!playing)
    }, [playing, audioRef])

    const requestAnimationFrameRef = useRef(0)
    const animate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
        requestAnimationFrameRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (playing) {
            requestAnimationFrameRef.current = requestAnimationFrame(animate)
        }

        return () => cancelAnimationFrame(requestAnimationFrameRef.current)
    }, [playing])

    const handleTimeUpdate = useCallback(
        e => {
            const time = e.currentTarget.currentTime
            setCurrentTime(time)
            onTimeUpdate(time)
        },
        [onTimeUpdate],
    )

    const seekBackward = useCallback(() => seekBy(-FORWARD_BACKWARD_JUMP_IN_SECONDS, audioRef.current), [
        audioRef,
    ])
    const seekForward = useCallback(() => seekBy(FORWARD_BACKWARD_JUMP_IN_SECONDS, audioRef.current), [
        audioRef,
    ])
    const onTrackTimeUpdate = useCallback(
        time => {
            const absoluteTime = task.text.before[0].timing.start + time
            seekTo(absoluteTime, audioRef.current)
        },
        [audioRef, task],
    )

    const timingInfo = useMemo(() => getAudioTimingInfo(task), [task])
    const normalizedCurrentTime = currentTime - task.text.before[0].timing.start

    return (
        <Strip>
            <PlaybackControls>
                <BackwardButton onClick={seekBackward} />
                <PlayButton playing={playing} onClick={togglePlayPause} />
                <ForwardButton onClick={seekForward} />
            </PlaybackControls>
            <AudioTrack
                duration={timingInfo.duration}
                currentTime={normalizedCurrentTime}
                activeSegment={{ timing: timingInfo.activeSegment, color: 'lightblue' }}
                onTrackTimeUpdate={onTrackTimeUpdate}
            />
            <audio
                ref={audioRef}
                controls
                src={`${src}#t=${task.text.before[0].timing.start},${
                    task.text.after[task.text.after.length - 1].timing.end
                }`}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                style={{
                    display: 'none',
                }}
            />
            <VolumeButton />
        </Strip>
    )
}
