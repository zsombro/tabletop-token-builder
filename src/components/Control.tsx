import { useState } from 'react'

export function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label>{label}</label>
      {children}
    </div>
  )
}

type NumberControlProps = {
    value: number
    onChange: (value: number) => void
    onCommit?: (value: number) => void
}

type ColorControlProps = {
    value: string
    onChange: (value: string) => void
    onCommit?: (value: string) => void
}

export function Scale({ value, onChange, onCommit }: NumberControlProps) {
    const handleCommit = (e: React.FormEvent<HTMLInputElement>) => {
        if (!onCommit) return
        onCommit(parseFloat(e.currentTarget.value))
    }

    const handleKeyboardCommit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!onCommit) return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            onCommit(parseFloat(e.currentTarget.value))
        }
    }

    return (
        <Control label="Scale">
            <input
                type="range"
                min="0.1"
                max="3"
                step="0.01"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                onKeyUp={handleKeyboardCommit}
            />
        </Control>
    )
}

export function OutlineWidth({ value, onChange, onCommit }: NumberControlProps) {
    const handleCommit = (e: React.FormEvent<HTMLInputElement>) => {
        if (!onCommit) return
        onCommit(parseInt(e.currentTarget.value, 10))
    }

    const handleKeyboardCommit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!onCommit) return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            onCommit(parseInt(e.currentTarget.value, 10))
        }
    }

    return (
        <Control label="Outline Width">
            <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                onKeyUp={handleKeyboardCommit}
            />
        </Control>
    )
}

export function OutlineColor({ value, onChange, onCommit }: ColorControlProps) {
    const handleCommit = (e: React.FormEvent<HTMLInputElement>) => {
        if (!onCommit) return
        onCommit(e.currentTarget.value)
    }

    return (
        <Control label="Outline Color">
            <input
                type="color"
                value={value}
                onInput={(e) => onChange((e.target as HTMLInputElement).value)}
                onChange={handleCommit}
            />
        </Control>
    )
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