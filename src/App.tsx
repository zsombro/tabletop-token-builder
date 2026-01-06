import { useEffect, useRef, useState } from 'react'
import './App.css'
import { OutlineColor, OutlineWidth, Scale } from './controls/Control'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const [outlineWidth, setOutlineWidth] = useState(10)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  function drawImage() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !image) return

    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2, true);
    ctx.clip();

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, offset.x, offset.y, image.width * scale, image.height * scale)

    ctx.strokeStyle = outlineColor
    ctx.lineWidth = outlineWidth
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, radius - (outlineWidth / 2), 0, Math.PI * 2)
    ctx.stroke()
  }

  useEffect(() => {
    drawImage()
  }, [scale, offset, outlineColor, outlineWidth, image])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items

      if (!items) return

      for (const item of items) {
        console.log(item)
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            const img = new Image()
            img.src = URL.createObjectURL(blob)
            img.onload = () => {
              setImage(img)
            }
            break
          }
        }
      }

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

  if (!image) {
    return <div className="App">Paste an image from your clipboard using Ctrl+V to get started.</div>
  }

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

export default App
