import { createRef, useEffect, useRef, useState } from 'react'
import './App.css'
import { OutlineColor, OutlineWidth, Scale } from './components/Control'
import { XYPad } from './components/XYPad'
import { extractClipboardImages } from './util/clipboard'
import { Editor } from './components/Editor'
import type { EditorHandle } from './components/Editor'
import { saveAllToZip } from './util/canvas'
import type { TokenImage, TokenSettings } from './types'
import posthog from './lib/posthog'

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

  function handleScaleCommit(value: number) {
    posthog.capture('control_changed', {
      control: 'scale',
      value,
    })
  }

  function handleOutlineWidthChange(value: number) {
    setOutlineWidth(value)
    applyToSelected('outlineWidth', value)
  }

  function handleOutlineWidthCommit(value: number) {
    posthog.capture('control_changed', {
      control: 'outline_width',
      value,
    })
  }

  function handleOutlineColorChange(value: string) {
    setOutlineColor(value)
    applyToSelected('outlineColor', value)
  }

  function handleOutlineColorCommit(value: string) {
    posthog.capture('control_changed', {
      control: 'outline_color',
      value,
    })
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
    const scaledOffset = { x: newOffset.x * 2, y: newOffset.y * 2 }
    setOffset(scaledOffset)
    applyToSelected('offset', scaledOffset)
    posthog.capture('control_changed', {
      control: 'offset',
      value: scaledOffset,
    })
  }

  function handleSelectAll() {
    setTokenImages(prev => prev && prev.map(ti => ({ ...ti, selected: true })))
    posthog.capture('control_clicked', {
      control: 'select_all',
    })
  }

  function handleUnselectAll() {
    setTokenImages(prev => prev && prev.map(ti => ({ ...ti, selected: false })))
    posthog.capture('control_clicked', {
      control: 'unselect_all',
    })
  }

  function handleSelectSingle(id: string) {
    setTokenImages(prev => prev && prev.map(ti => ({ ...ti, selected: ti.id === id })))
    posthog.capture('control_clicked', {
      control: 'select_single',
      token_id: id,
    })
  }

  const [editorRefs, setEditorRefs] = useState<Record<string, React.RefObject<EditorHandle | null>>>({})

  function addEditorRefs(images: TokenImage[]) {
    setEditorRefs(prev => {
      const nextRefs = { ...prev }

      for (const image of images) {
        nextRefs[image.id] ??= createRef<EditorHandle>()
      }

      return nextRefs
    })
  }

  async function handleSaveAll() {
    if (!tokenImages) return
    const entries = await Promise.all(
      tokenImages.map(async ti => {
        const blob = await editorRefs[ti.id]?.current?.getBlob()
        return blob ? { filename: `token-${ti.id}.png`, blob } : null
      })
    )
    const savedTokenCount = entries.filter(e => e !== null).length
    await saveAllToZip(entries.filter(e => e !== null))
    posthog.capture('control_clicked', {
      control: 'save_all',
    })
    posthog.capture('tokens_saved', { token_count: savedTokenCount })
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
        if (validImages.length > 0) {
          const wrappedImages = wrapImages(validImages)
          addEditorRefs(wrappedImages)
          setTokenImages(prev => [...(prev || []), ...wrappedImages])
          posthog.capture('images_added', { image_count: validImages.length, source: 'clipboard' })
        }
      })
    }

    const handleDragOver = (e: DragEvent) => e.preventDefault()

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const items = e.dataTransfer?.items
      if (!items) return
      extractClipboardImages(items).then(validImages => {
        if (validImages.length > 0) {
          const wrappedImages = wrapImages(validImages)
          addEditorRefs(wrappedImages)
          setTokenImages(prev => [...(prev || []), ...wrappedImages])
          posthog.capture('images_added', { image_count: validImages.length, source: 'drag_and_drop' })
        }
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
        <div className="settings">
          <Scale value={scale} onChange={handleScaleChange} onCommit={handleScaleCommit} />
          <XYPad onChange={handleGlobalOffsetChange} />
          <OutlineWidth value={outlineWidth} onChange={handleOutlineWidthChange} onCommit={handleOutlineWidthCommit} />
          <OutlineColor value={outlineColor} onChange={handleOutlineColorChange} onCommit={handleOutlineColorCommit} />
        </div>
        <div className="actions">
          <button onClick={handleSelectAll}>Select all</button>
          <button onClick={handleUnselectAll}>Unselect all</button>
          <button onClick={handleSaveAll}>Save all</button>
        </div>
      </div>
      <div className="image-list">
        {tokenImages.map(tokenImage => (
          <Editor
            key={tokenImage.id}
            ref={editorRefs[tokenImage.id]}
            tokenImage={tokenImage}
            onToggleSelect={() => handleToggleSelect(tokenImage.id)}
            onClick={() => handleSelectSingle(tokenImage.id)}
            onOffsetChange={newOffset => handleOffsetChange(tokenImage.id, newOffset)}
          />
        ))}
        <div className="editor-card-add-more">Paste or drag more images</div>
      </div>
    </div>
  )

}

export default App
