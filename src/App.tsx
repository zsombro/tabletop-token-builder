import { useEffect, useRef, useState } from 'react'
import './App.css'
import { OutlineColor, OutlineWidth, Scale } from './components/Control'
import { extractClipboardImages } from './util/clipboard'
import { Editor } from './components/Editor'
import type { TokenImage } from './types'

function App() {
  const [tokenImages, setTokenImages] = useState<TokenImage[] | null>(null)

  const [outlineWidth, setOutlineWidth] = useState(10)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [scale, setScale] = useState(0.5)
  // _setOffset: setter reserved for when the offset UI control is added
  const [offset, _setOffset] = useState({ x: 0, y: 0 })

  // Keeps the latest defaults accessible inside the stable event-listener closure
  const defaults = useRef({ scale, offset, outlineWidth, outlineColor })
  useEffect(() => {
    defaults.current = { scale, offset, outlineWidth, outlineColor }
  }, [scale, offset, outlineWidth, outlineColor])

  function applyToSelected<K extends keyof TokenImage['settings']>(key: K, value: TokenImage['settings'][K]) {
    setTokenImages(prev => prev && prev.map(ti =>
      ti.selected ? { ...ti, settings: { ...ti.settings, [key]: value } } : ti
    ))
  }

  function handleScaleChange(value: number) {
    setScale(value)
    applyToSelected('scale', value)
  }

  function handleOutlineWidthChange(value: number) {
    setOutlineWidth(value)
    applyToSelected('outlineWidth', value)
  }

  function handleOutlineColorChange(value: string) {
    setOutlineColor(value)
    applyToSelected('outlineColor', value)
  }

  function handleToggleSelect(id: string) {
    setTokenImages(prev => prev && prev.map(ti =>
      ti.id === id ? { ...ti, selected: !ti.selected } : ti
    ))
  }

  function handleOffsetChange(id: string, newOffset: { x: number; y: number }) {
    setTokenImages(prev => prev && prev.map(ti =>
      ti.id === id ? { ...ti, settings: { ...ti.settings, offset: newOffset } } : ti
    ))
  }

  useEffect(() => {
    function wrapImages(validImages: HTMLImageElement[]): TokenImage[] {
      return validImages.map(image => ({
        id: crypto.randomUUID(),
        image,
        selected: true,
        settings: { ...defaults.current }
      }))
    }

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0)
          setTokenImages(prev => [...(prev || []), ...wrapImages(validImages)])
      })
    }

    const handleDragOver = (e: DragEvent) => e.preventDefault()

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const items = e.dataTransfer?.items
      if (!items) return
      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0)
          setTokenImages(prev => [...(prev || []), ...wrapImages(validImages)])
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

  if (!tokenImages) {
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
        <Scale value={scale} onChange={handleScaleChange} />
        <OutlineWidth value={outlineWidth} onChange={handleOutlineWidthChange} />
        <OutlineColor value={outlineColor} onChange={handleOutlineColorChange} />
        <div><p>You can paste another image without losing these settings</p><p>Use the mouse to drag the image around</p></div>
      </div>
      <div className="image-list">
        {tokenImages.map(tokenImage => (
          <Editor
            key={tokenImage.id}
            tokenImage={tokenImage}
            onToggleSelect={() => handleToggleSelect(tokenImage.id)}
            onOffsetChange={newOffset => handleOffsetChange(tokenImage.id, newOffset)}
          />
        ))}
      </div>
    </div>
  )

}

export default App
