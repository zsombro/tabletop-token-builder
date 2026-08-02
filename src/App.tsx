import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Offset, OutlineColor, OutlineWidth, Scale } from './components/Control'
import { extractClipboardImages } from './util/clipboard'
import { Editor } from './components/Editor'
import type { TokenImage, TokenSettings } from './types'

function App() {
  const [tokenImages, setTokenImages] = useState<TokenImage[] | null>(null)

  const [outlineWidth, setOutlineWidth] = useState(10)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [scale, setScale] = useState(0.5)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const globalSettingsRef = useRef<TokenSettings>({
    scale,
    offset,
    outlineWidth,
    outlineColor
  })

  useEffect(() => {
    globalSettingsRef.current = {
      scale,
      offset,
      outlineWidth,
      outlineColor
    }
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

  function handleGlobalOffsetChange(newOffset: { x: number; y: number }) {
    setOffset(newOffset)
    applyToSelected('offset', newOffset)
  }

  function handleSelectAll() {
    setTokenImages(prev => prev && prev.map(ti => ({ ...ti, selected: true })))
  }

  function handleUnselectAll() {
    setTokenImages(prev => prev && prev.map(ti => ({ ...ti, selected: false })))
  }

  useEffect(() => {
    function wrapImages(validImages: HTMLImageElement[]): TokenImage[] {
      const settings = globalSettingsRef.current
      return validImages.map(image => ({
        id: crypto.randomUUID(),
        image,
        selected: true,
        settings: {
          scale: settings.scale,
          offset: settings.offset,
          outlineWidth: settings.outlineWidth,
          outlineColor: settings.outlineColor
        }
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
        <div className="start-panel">Paste an image from your clipboard using Ctrl+V</div>
        <div className="start-separator"><span>OR</span></div>
        <div className="start-panel">Drag one or more images here from your computer</div>
      </div>
    )
  }

  return (
    <div className="editor">
      <div className="controls">
        <button onClick={handleSelectAll}>Select all</button>
        <button onClick={handleUnselectAll}>Unselect all</button>
        <Scale value={scale} onChange={handleScaleChange} />
        <Offset onChange={handleGlobalOffsetChange} />
        <OutlineWidth value={outlineWidth} onChange={handleOutlineWidthChange} />
        <OutlineColor value={outlineColor} onChange={handleOutlineColorChange} />
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
        <div className="editor-card-add-more">Paste or drag more images</div>
      </div>
    </div>
  )

}

export default App
