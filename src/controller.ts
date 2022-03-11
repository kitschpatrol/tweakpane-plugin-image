import {Controller, Value, ViewProps} from '@tweakpane/core';

import {ImageResolvable} from './model';
import {createPlaceholderImage, loadImage} from './utils';
import {PluginView} from './view';

interface Config {
	value: Value<ImageResolvable>;
	imageFit: 'contain' | 'cover';
	extensions: string[];
	viewProps: ViewProps;
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void;
}

let placeholderImage: HTMLImageElement | null = null;

export class PluginController implements Controller<PluginView> {
	public readonly value: Value<ImageResolvable>;
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config) {
		this.value = config.value;
		this.viewProps = config.viewProps;
		this.view = new PluginView(doc, {
			viewProps: this.viewProps,
			extensions: config.extensions,
			imageFit: config.imageFit,
			clickCallback: config.clickCallback,
		});

		this.onFile = this.onFile.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);

		this.view.input.addEventListener('change', this.onFile);
		this.view.element.addEventListener('drop', this.onDrop);
		this.view.element.addEventListener('dragover', this.onDragOver);
		this.view.element.addEventListener('dragleave', this.onDragLeave);

		this.viewProps.handleDispose(() => {
			this.view.input.removeEventListener('change', this.onFile);
			this.view.input.removeEventListener('drop', this.onDrop);
			this.view.input.removeEventListener('dragover', this.onDragOver);
			this.view.input.removeEventListener('dragleave', this.onDragLeave);
		});

		this.value.emitter.on('change', this.handleValueChange.bind(this));

		this.handleValueChange();
	}

	private onFile(event: Event): void {
		const files = (event?.target as HTMLInputElement).files;
		if (!files || !files.length) return;

		const file = files[0];
		this.setValue(file);
		// this.updateImage(url);
	}

	private async onDrop(event: DragEvent) {
		event.preventDefault();
		try {
			const {dataTransfer} = event;
			const file = dataTransfer?.files[0];
			if (file) {
				// const url = URL.createObjectURL(file);
				// this.updateImage(url);
				this.setValue(file);
			} else {
				const url = dataTransfer?.getData('url');
				if (!url) throw new Error('No url');
				this.setValue(url);
				// loadImage(url).then(async (image) => {
				// 	console.log('drop', image);
				// 	const clone = await cloneImage(image);
				// 	// this.updateImage(clone.src);
				// 	this.setValue(clone);
				// });
			}
		} catch (e) {
			console.error('Could not parse the dropped image', e);
		} finally {
			this.view.changeDraggingState(false);
		}
	}

	private onDragOver(event: Event) {
		event.preventDefault();
		this.view.changeDraggingState(true);
	}

	private onDragLeave() {
		this.view.changeDraggingState(false);
	}

	private async handleImage(image: ImageResolvable) {
		if (image instanceof HTMLImageElement) {
			this.updateImage(image.src);
		} else if (typeof image === 'string' || !image) {
			if (image === 'placeholder' || !image) {
				image = (await this.handlePlaceholderImage()).src;
			}
			this.updateImage(image);
		} else {
			await this.setValue(image);
		}
	}

	private updateImage(src: string) {
		this.view.changeImage(src);
	}

	private async setValue(src: ImageResolvable) {
		if (src instanceof HTMLImageElement) {
			this.value.setRawValue(src);
		} else if (src instanceof File) {
			const url = URL.createObjectURL(src);
			(src as any).src = url;
			const img = await loadImage(url).catch(() => {
				// URL.revokeObjectURL(url);
			});
			// URL.revokeObjectURL(url); //todo: revoke sometime.
			this.value.setRawValue(img || src);
		} else if (src) {
			this.value.setRawValue(await loadImage(src));
		} else {
			this.value.setRawValue(await this.handlePlaceholderImage());
		}
	}

	private handleValueChange() {
		this.handleImage(this.value.rawValue);
	}

	private async handlePlaceholderImage(): Promise<HTMLImageElement> {
		if (!placeholderImage) {
			placeholderImage = await createPlaceholderImage();
		}
		return placeholderImage;
	}
}
