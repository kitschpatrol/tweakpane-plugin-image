/** Create an image with anonymous cross-origin loading. */
export function loadImage(src: string): HTMLImageElement {
	const image = new Image()
	image.crossOrigin = 'anonymous'
	image.src = src
	return image
}

/** Clone an image through a canvas. */
export async function cloneImage(source: HTMLImageElement): Promise<HTMLImageElement> {
	const canvas = document.createElement('canvas')
	canvas.width = source.width
	canvas.height = source.height

	const context = canvas.getContext('2d')!
	context.drawImage(source, 0, 0)

	const image = new Image()
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				resolve(image)
				return
			}

			image.src = URL.createObjectURL(blob)
			image.addEventListener('load', () => {
				resolve(image)
			})
		})
	})
}
