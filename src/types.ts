export type TokenSettings = {
  scale: number
  offset: { x: number; y: number }
  outlineWidth: number
  outlineColor: string
}

export type TokenImage = {
  id: string
  image: HTMLImageElement
  selected: boolean
  settings: TokenSettings
}
