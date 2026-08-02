import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { canvasToBlob, drawImage, saveToImageFile } from '../util/canvas'
import type { TokenImage } from '../types'
import posthog from '../lib/posthog'

export type EditorHandle = { getBlob: () => Promise<Blob | null> }

export type EditorProps = {
  tokenImage: TokenImage
  onToggleSelect: () => void
  onOffsetChange: (offset: { x: number; y: number }) => void
  ref?: React.Ref<EditorHandle | null>
}

export function Editor({ tokenImage, onToggleSelect, onOffsetChange, ref }: EditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useImperativeHandle(ref, () => ({ getBlob: () => canvasToBlob(canvasRef.current!) }))
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

  function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    saveToImageFile(canvas, `token-${tokenImage.id}.png`)
    posthog.capture('token_saved')
    setMenuOpen(false)
  }

  return (
    <div className="editor-card">
      <div className="editor-card-header">
        <label className="editor-card-checkbox">
          <input type="checkbox" checked={tokenImage.selected} onChange={onToggleSelect} />
          <span />
        </label>
        <div className="editor-card-menu-wrapper">
          <button className="editor-card-menu" aria-label="Options" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
          {menuOpen && (
            <div className="editor-card-dropdown">
              <button className="editor-card-dropdown-item" onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
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