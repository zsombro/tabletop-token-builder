import { useEffect, useRef, useState } from 'react'
import { drawImage } from '../util/canvas'
import type { TokenImage } from '../types'

export type EditorProps = {
  tokenImage: TokenImage
  onToggleSelect: () => void
  onOffsetChange: (offset: { x: number; y: number }) => void
}

export function Editor({ tokenImage, onToggleSelect, onOffsetChange }: EditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const { scale, offset, outlineWidth, outlineColor } = tokenImage.settings
  const [localOffset, setLocalOffset] = useState(offset)

  useEffect(() => {
    if (!dragging) setLocalOffset(offset)
  }, [offset, dragging])

  // As recommended by the official Roll20 docs
  // https://roll20partners.zendesk.com/hc/en-us/articles/10828203014423-Image-Dimensions-Resolution-and-File-Type-Specifications#h_01H910BV0VJ2X9PWCPZSF179GH
  const TOKEN_SIZE = 280

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawImage(canvas, tokenImage.image, localOffset, scale, outlineColor, outlineWidth)
  }, [tokenImage.image, localOffset, scale, outlineColor, outlineWidth])

  function canvasMouseDrag(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging) return
    const { movementX, movementY } = e
    setLocalOffset(prev => ({
      x: prev.x + movementX,
      y: prev.y + movementY
    }))
  }

  return (
    <div className="editor-card">
      <div className="editor-card-header">
        <label className="editor-card-checkbox">
          <input type="checkbox" checked={tokenImage.selected} onChange={onToggleSelect} />
          <span />
        </label>
        <button className="editor-card-menu" aria-label="Options">⋮</button>
      </div>
      <canvas
        ref={canvasRef}
        width={TOKEN_SIZE}
        height={TOKEN_SIZE}
        style={{ width: TOKEN_SIZE / 2, height: TOKEN_SIZE / 2 }}
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => { setDragging(false); onOffsetChange(localOffset) }}
        onMouseLeave={() => { setDragging(false); onOffsetChange(localOffset) }}
        onMouseMove={canvasMouseDrag}
      ></canvas>
    </div>
  )
}