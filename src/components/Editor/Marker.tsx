import React from 'react'
import { Rect } from 'src/utils/rect'

interface MarkerProps {
    rect: Rect
}

export const Marker = ({ rect }: MarkerProps) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: rect.y,
                left: rect.x,
                width: rect.width,
                height: rect.height,
                backgroundColor: '#ffffb8',
                borderRadius: 3,
                zIndex: 0,
            }}
        />
    )
}
