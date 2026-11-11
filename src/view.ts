import type { View, ViewProps } from '@tweakpane/core'
import { ClassName } from '@tweakpane/core'

type Config = {
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void
	extensions: string[]
	imageFit: 'contain' | 'cover'
	viewProps: ViewProps
}

const className = ClassName('img')

export class PluginView implements View {
	public readonly element: HTMLElement
	public readonly image_: HTMLImageElement
	public readonly input: HTMLInputElement
	private readonly placeholder_: HTMLElement

	constructor(doc: Document, config: Config) {
		this.onImageLoad_ = this.onImageLoad_.bind(this)

		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		this.input = doc.createElement('input')
		this.input.classList.add(className('input'))
		this.input.setAttribute('type', 'file')
		this.input.setAttribute('accept', config.extensions.join(','))

		this.placeholder_ = doc.createElement('div')
		this.placeholder_.classList.add(className('placeholder'))
		this.placeholder_.textContent = 'No Image'

		this.image_ = doc.createElement('img')
		this.image_.id = 'tpimg_' + Math.random().toString(36).slice(2) // Need unique for drop
		this.image_.classList.add(className('image'), className(`image_${config.imageFit}`))
		this.image_.crossOrigin = 'anonymous'
		this.image_.style.display = 'none' // Initially hidden

		const handleClick = (event: MouseEvent) => {
			if (config.clickCallback) {
				config.clickCallback(event, this.input)
			} else {
				this.input.click()
			}
		}

		this.image_.addEventListener('click', handleClick)
		this.placeholder_.addEventListener('click', handleClick)

		this.element.classList.add(className('area_root'))

		this.element.append(this.placeholder_)
		this.element.append(this.image_)
		this.element.append(this.input)
	}

	changeDraggingState(state: boolean) {
		const { element } = this
		if (state) {
			element.classList.add(className('area_dragging'))
		} else {
			element.classList.remove(className('area_dragging'))
		}
	}

	changeImage(src: string) {
		if (src === '' || src === 'placeholder') {
			this.image_.removeEventListener('load', this.onImageLoad_)
			this.image_.style.display = 'none'
			this.placeholder_.style.display = 'flex'
		} else {
			// Keep placeholder visible until image loads to prevent layout shift
			this.image_.addEventListener('load', this.onImageLoad_)
			this.image_.src = src
		}
	}

	private onImageLoad_() {
		this.image_.style.display = 'block'
		this.placeholder_.style.display = 'none'
	}
}
