export function loadImage(src: string): HTMLImageElement {
	const image = new Image();
	image.crossOrigin = 'anonymous';
	image.src = src;
	// image.onload = () => {
	// };
	// image.onerror = reject;
	return image;
}

export function cloneImage(
	source: HTMLImageElement,
): Promise<HTMLImageElement> {
	const canvas = document.createElement('canvas');
	canvas.width = source.width;
	canvas.height = source.height;

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(source, 0, 0);

	const image = new Image();
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				resolve(image);
				return;
			}
			image.src = URL.createObjectURL(blob);
			image.onload = () => {
				resolve(image);
			};
		});
	});
}
