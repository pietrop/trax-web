import React from 'react'
import styled from 'styled-components/macro'
import { Range } from 'src/models'

const Audio = styled.audio`
    position: fixed;
    width: 100%;
    bottom: 0;
`

interface AudioPlayerProps {
    src: string
    timing: Range
    onTimeUpdate?: (time: number) => void
}

export const AudioPlayer = ({ src, timing: { start, end }, onTimeUpdate }: AudioPlayerProps) => {
    return (
        <Audio
            controls
            src={`${src}#t=${start},${end}`}
            onTimeUpdate={e => onTimeUpdate && onTimeUpdate(e.currentTarget.currentTime)}
        />
    )
}
