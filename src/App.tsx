import { useEffect, useRef, useState } from 'react'
import './App.css'
import { OutlineColor, OutlineWidth, Scale } from './components/Control'
import { extractClipboardImages } from './service/clipboard'
import { Editor } from './components/Editor'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [images, setImages] = useState<HTMLImageElement[] | null>(null)
  const [dragging, setDragging] = useState(false)

  const [outlineWidth, setOutlineWidth] = useState(10)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  function drawImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !images) return

    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2, true);
    ctx.clip();

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(images[0], offset.x, offset.y, images[0].width * scale, images[0].height * scale)

    ctx.strokeStyle = outlineColor
    ctx.lineWidth = outlineWidth
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, radius - (outlineWidth / 2), 0, Math.PI * 2)
    ctx.stroke()
  }

  useEffect(() => {
    drawImage()
  }, [scale, offset, outlineColor, outlineWidth, images])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items

      if (!items) return

      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0) {
          setImages(validImages)
        }
      })

    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  function canvasMouseDrag(e: React.MouseEvent) {
    if (!dragging) return

    const { movementX, movementY } = e
    setOffset(prev => ({
      x: prev.x + movementX,
      y: prev.y + movementY
    }))
  }

  function saveImageToFile() {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'avatar.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  if (!images) {
    return (
      <div className="start-screen">
        <div className="start-panel">Paste an image from your clipboard using Ctrl+V to get started.</div>
        <div className="start-separator"><span>OR</span></div>
        <div className="start-panel">Drag one or more images here from your computer.</div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="editor">
        <div className="controls">
          <Scale value={scale} onChange={setScale} />
          <OutlineWidth value={outlineWidth} onChange={setOutlineWidth} />
          <OutlineColor value={outlineColor} onChange={setOutlineColor} />
          <div><p>You can paste another image without losing these settings</p><p>Use the mouse to drag the image around</p></div>
          <button onClick={saveImageToFile}>Save Image</button>
        </div>
        <canvas id="canvas" width={500} height={500} ref={canvasRef} onMouseMove={canvasMouseDrag} onMouseDown={() => setDragging(true)} onMouseUp={() => setDragging(false)}></canvas>
      </div>
    )
  }

  return (
    <div className="editor">
      <div className="controls"></div>
      {images.map((image, index) => (
        <Editor key={index} image={image} />
      ))}
    </div>
  )
}

export default App
