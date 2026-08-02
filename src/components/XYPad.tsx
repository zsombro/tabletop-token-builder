import React, { useState } from "react";
import { Control } from "./Control";

export function XYPad({ onChange }: { onChange: (offset: { x: number; y: number }) => void }) {
    const [dragging, setDragging] = useState(false)
    const [localOffset, setLocalOffset] = useState({ x: 0, y: 0 })

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!dragging) return
        setLocalOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))
    }

    return (
        <Control label="Move">
            <div
                className="xy-pad"
                onMouseDown={() => setDragging(true)}
                onMouseUp={() => { setDragging(false); onChange(localOffset) }}
                onMouseLeave={() => { setDragging(false); onChange(localOffset) }}
                onMouseMove={handleMouseMove}
            >
                <div
                    className="xy-pad-dot"
                    style={{ transform: `translate(${localOffset.x}px, ${localOffset.y}px)` }}
                />
            </div>
        </Control>
    )
}