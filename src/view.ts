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
	private readonly placeholder_: HTMLElement;

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		config.viewProps.bindClassModifiers(this.element);

		this.input = doc.createElement('input');
		this.input.classList.add(className('input'));
		this.input.setAttribute('type', 'file');
		this.input.setAttribute('accept', config.extensions.join(','));

		this.placeholder_ = doc.createElement('div');
		this.placeholder_.classList.add(className('placeholder'));
		this.placeholder_.textContent = 'No Image';

		this.image_ = doc.createElement('img');
		this.image_.id = 'tpimg_' + Math.random().toString(36).slice(2); // need unique for drop
		this.image_.classList.add(className('image'));
		this.image_.classList.add(className(`image_${config.imageFit}`));
		this.image_.crossOrigin = 'anonymous';
		this.image_.style.display = 'none'; // Initially hidden

		const handleClick = (event: MouseEvent) => {
			return config.clickCallback
				? config.clickCallback(event, this.input)
				: this.input.click();
		};

		this.image_.onclick = handleClick;
		this.placeholder_.onclick = handleClick;

		this.element.classList.add(className('area_root'));

		this.element.appendChild(this.placeholder_);
		this.element.appendChild(this.image_);
		this.element.appendChild(this.input);
	}

	changeImage(src: string) {
		const hasImage = src && src !== '' && src !== 'placeholder';
		if (hasImage) {
			// Keep placeholder visible until image loads to prevent layout shift
			this.image_.onload = () => {
				this.image_.style.display = 'block';
				this.placeholder_.style.display = 'none';
			};
			this.image_.src = src;
		} else {
			this.image_.style.display = 'none';
			this.placeholder_.style.display = 'flex';
		}
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
