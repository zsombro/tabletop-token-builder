async function itemToImage(item: DataTransferItem): Promise<HTMLImageElement | null> {
    const blob = item.getAsFile()

    if (!blob) return null

    const img = new Image()
    img.src = URL.createObjectURL(blob)
    return new Promise<HTMLImageElement | null>(resolve => {
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
    })
}

export async function extractClipboardImages(items: DataTransferItemList): Promise<(HTMLImageElement[])> {
    const images = await Promise.all(
        Array.from(items)
            .filter(item => item.type.indexOf('image') !== -1)
            .map(itemToImage)
    )
    const validImages = images.filter((img): img is HTMLImageElement => img !== null)
    return validImages
}