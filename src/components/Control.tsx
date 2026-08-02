import { useState } from 'react'

export function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function Scale({ value, onChange }: { value: number; onChange: (value: number) => void }) {    
    return (<Control label="Scale"><input type="range" min="0.1" max="3" step="0.01" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} /></Control>)
}

export function OutlineWidth({ value, onChange }: { value: number; onChange: (value: number) => void }) {    
    return (<Control label="Outline Width"><input type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(parseInt(e.target.value))} /></Control>)
}

export function OutlineColor({ value, onChange }: { value: string; onChange: (value: string) => void }) {    
    return (<Control label="Outline Color"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /></Control>)
}

export function Offset({ onChange }: { onChange: (offset: { x: number; y: number }) => void }) {
    const [dragging, setDragging] = useState(false)
    const [localOffset, setLocalOffset] = useState({ x: 0, y: 0 })

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!dragging) return
        setLocalOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))
    }

    return (
        <Control label="Move">
            <div
                className="offset-pad"
                onMouseDown={() => setDragging(true)}
                onMouseUp={() => { setDragging(false); onChange(localOffset) }}
                onMouseLeave={() => { setDragging(false); onChange(localOffset) }}
                onMouseMove={handleMouseMove}
            />
        </Control>
    )
}