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