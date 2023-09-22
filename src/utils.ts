export function createPlaceholderImage(): HTMLImageElement {
	const canvas = document.createElement('canvas');
	canvas.width = 320;
	canvas.height = 50;

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#00000004';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#eee';
	ctx.font =
		'1.25rem "Roboto Mono", "Source Code Pro", Menlo, Courier, monospace';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('No image', canvas.width * 0.5, canvas.height * 0.5);
	const image = new Image();
	// if (!blob) {
	// 	resolve(image);
	// 	return;
	// }
	image.src = canvas.toDataURL('image/png', 0.8);
	(image as any).isPlaceholder = true;
	// image.onload = () => {
	// 	resolve(image);
	// };
	return image;
}

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
