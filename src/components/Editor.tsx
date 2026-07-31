import { useEffect, useRef } from 'react'

export function Editor({ image }: { image: HTMLImageElement }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(image, 0, 0)
    }, [image])

    return (<>
        <canvas ref={canvasRef} width={500} height={500}></canvas>
    </>)
}