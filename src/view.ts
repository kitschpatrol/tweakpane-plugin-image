import {ClassName, View, ViewProps} from '@tweakpane/core';

interface Config {
	viewProps: ViewProps;
	imageFit: 'contain' | 'cover';
	extensions: string[];
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void;
}

const className = ClassName('img');

export class PluginView implements View {
	public readonly element: HTMLElement;
	public readonly input: HTMLInputElement;
	public readonly image_: HTMLImageElement;

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		config.viewProps.bindClassModifiers(this.element);

		this.input = doc.createElement('input');
		this.input.classList.add(className('input'));
		this.input.setAttribute('type', 'file');
		this.input.setAttribute('accept', config.extensions.join(','));

		this.image_ = doc.createElement('img');
		this.image_.id = 'tpimg_' + Math.random().toString(36).slice(2); // need unique for drop
		this.image_.classList.add(className('image'));
		this.image_.classList.add(className(`image_${config.imageFit}`));
		this.image_.crossOrigin = 'anonymous';
		this.image_.onclick = (event) => {
			config.clickCallback
				? config.clickCallback(event, this.input)
				: this.input.click();
		};

		this.element.classList.add(className('area_root'));

		this.element.appendChild(this.image_);
		this.element.appendChild(this.input);
	}

	changeImage(src: string) {
		this.image_.src = src;
	}

	changeDraggingState(state: boolean) {
		const el = this.element;
		if (state) {
			el?.classList.add(className('area_dragging'));
		} else {
			el?.classList.remove(className('area_dragging'));
		}
	}
}
