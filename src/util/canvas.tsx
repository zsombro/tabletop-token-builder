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
