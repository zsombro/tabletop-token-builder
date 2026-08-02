import { useEffect, useRef, useState } from 'react'
import './App.css'
import { OutlineColor, OutlineWidth, Scale } from './components/Control'
import { extractClipboardImages } from './util/clipboard'
import { drawImage } from './util/canvas'
import { Editor } from './components/Editor'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [images, setImages] = useState<HTMLImageElement[] | null>(null)

  const [outlineWidth, setOutlineWidth] = useState(10)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [scale, setScale] = useState(0.5)
  const [offset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !images) return
    drawImage(canvas, images[0], offset, scale, outlineColor, outlineWidth)
  }, [scale, offset, outlineColor, outlineWidth, images])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0) setImages(prevImages => [...(prevImages || []), ...validImages])
      })
    }

    const handleDragOver = (e: DragEvent) => e.preventDefault()

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const items = e.dataTransfer?.items
      if (!items) return
      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0) setImages(prevImages => [...(prevImages || []), ...validImages])
      })
    }

    window.addEventListener('paste', handlePaste)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)
    return () => {
      window.removeEventListener('paste', handlePaste)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

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

  return (
    <div className="editor">
      <div className="controls">
        <Scale value={scale} onChange={setScale} />
        <OutlineWidth value={outlineWidth} onChange={setOutlineWidth} />
        <OutlineColor value={outlineColor} onChange={setOutlineColor} />
        <div><p>You can paste another image without losing these settings</p><p>Use the mouse to drag the image around</p></div>
        <button onClick={saveImageToFile}>Save Image</button>
      </div>
      <div className="image-list">
        {images.map((image, index) => (
          <Editor
            key={`${image.src}-${index}`}
            image={image}
            tokenSettings={{
              scale,
              offset,
              outlineWidth,
              outlineColor
            }}
          />
        ))}
      </div>
    </div>
  )

}

export default App
