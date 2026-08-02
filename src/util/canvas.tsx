import JSZip from 'jszip'

export function drawImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  offset: { x: number; y: number },
  scale: number,
  outlineColor: string,
  outlineWidth: number
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

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

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve))
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function saveToImageFile(canvas: HTMLCanvasElement, filename: string) {
  canvasToBlob(canvas).then(blob => { if (blob) triggerDownload(blob, filename) })
}

export async function saveAllToZip(entries: { filename: string; blob: Blob }[], zipName = 'tokens.zip') {
  const zip = new JSZip()
  for (const { filename, blob } of entries) zip.file(filename, blob)
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(zipBlob, zipName)
}
