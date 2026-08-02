import { useEffect, useRef, useState } from 'react'
import { drawImage } from '../util/canvas'

export type EditorProps = {
    selected?: boolean
    image: HTMLImageElement
    tokenSettings?: {
        scale?: number
        offset?: { x: number, y: number }
        outlineWidth?: number
        outlineColor?: string
    }
}

export function Editor({ image, selected = false, tokenSettings = {} }: EditorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [dragging, setDragging] = useState(false)
    const {
        scale = 1,
        offset = { x: 0, y: 0 },
        outlineWidth = 10,
        outlineColor = '#000000'
    } = tokenSettings
    const [localOffset, setLocalOffset] = useState(offset)

    useEffect(() => {
        setLocalOffset(offset)
    }, [offset])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        drawImage(canvas, image, localOffset, scale, outlineColor, outlineWidth)
    }, [image, localOffset, scale, outlineColor, outlineWidth])

    function canvasMouseDrag(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!dragging) return

        const { movementX, movementY } = e
        setLocalOffset(prev => ({
            x: prev.x + movementX,
            y: prev.y + movementY
        }))
    }

    return (<>
        <input type="checkbox" checked={selected} readOnly />
        <canvas
            ref={canvasRef}
            width={250}
            height={250}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onMouseMove={canvasMouseDrag}
        ></canvas>
    </>)
}