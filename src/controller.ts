import type { Controller, Value, ViewProps } from '@tweakpane/core'
import type { ImageResolvable } from './model'
import { loadImage } from './utils'
import { PluginView } from './view'

type Config = {
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void
	extensions: string[]
	imageFit: 'contain' | 'cover'
	value: Value<unknown>
	viewProps: ViewProps
}

export class PluginController implements Controller<PluginView> {
	public readonly value: Value<unknown>
	public readonly view: PluginView
	public readonly viewProps: ViewProps

	constructor(doc: Document, config: Config) {
		this.value = config.value
		this.viewProps = config.viewProps
		this.view = new PluginView(doc, {
			clickCallback: config.clickCallback,
			extensions: config.extensions,
			imageFit: config.imageFit,
			viewProps: this.viewProps,
		})

		this.onFile = this.onFile.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.onDragStart = this.onDragStart.bind(this)
		this.onDragOver = this.onDragOver.bind(this)
		this.onDragLeave = this.onDragLeave.bind(this)

		this.view.input.addEventListener('change', this.onFile)
		this.view.element.addEventListener('drop', this.onDrop)
		this.view.element.addEventListener('dragstart', this.onDragStart)
		this.view.element.addEventListener('dragover', this.onDragOver)
		this.view.element.addEventListener('dragleave', this.onDragLeave)

		this.viewProps.handleDispose(() => {
			this.view.input.removeEventListener('change', this.onFile)
			this.view.element.removeEventListener('drop', this.onDrop)
			this.view.element.removeEventListener('dragstart', this.onDragStart)
			this.view.element.removeEventListener('dragover', this.onDragOver)
			this.view.element.removeEventListener('dragleave', this.onDragLeave)
		})

		this.value.emitter.on('change', () => {
			this.handleValueChange()
		})

		this.handleValueChange()
	}

	private handleImage(image: unknown) {
		if (image instanceof HTMLImageElement) {
			this.updateImage(image.src)
		} else if (image instanceof File) {
			this.setValue(image)
		} else if (typeof image === 'string') {
			this.updateImage(image)
		} else {
			this.updateImage('')
		}
	}

	private handleValueChange() {
		this.handleImage(this.value.rawValue)
	}

	private onDragLeave() {
		this.view.changeDraggingState(false)
	}

	private onDragOver(event: Event) {
		event.preventDefault()
		this.view.changeDraggingState(true)
	}

	private onDragStart(event: DragEvent) {
		event.dataTransfer?.setData('img-id', this.view.image_.id)
		event.dataTransfer?.setDragImage(this.view.image_, 0, 0)
	}

	private onDrop(event: DragEvent) {
		event.preventDefault()
		try {
			const { dataTransfer } = event
			const file = dataTransfer?.files[0]
			if (file) {
				this.setValue(file)
				return
			}

			// An image dragged from another document (iframe, popup window, or
			// shadow root) can't be found by id, so fall through to its URL
			const imageId = dataTransfer?.getData('img-id') ?? ''
			const image =
				imageId === '' ? null : document.querySelector<HTMLImageElement>(`#${CSS.escape(imageId)}`)
			if (image) {
				this.setValue(image)
				return
			}

			const url = dataTransfer?.getData('url') ?? ''
			if (url === '') {
				throw new Error('No url')
			}

			this.setValue(url)
		} catch (error) {
			console.error('Could not parse the dropped image', error)
		} finally {
			this.view.changeDraggingState(false)
		}
	}

	private onFile(): void {
		const file = this.view.input.files?.item(0)
		if (!file) {
			return
		}

		this.setValue(file)
	}

	private setValue(src: ImageResolvable) {
		if (src instanceof HTMLImageElement) {
			this.value.setRawValue(src)
		} else if (src instanceof File) {
			const url = URL.createObjectURL(src) + '#' + src.name
			Object.assign(src, { src: url })
			this.value.setRawValue(loadImage(url))
		} else if (src === '') {
			this.value.setRawValue('placeholder')
		} else {
			this.value.setRawValue(loadImage(src))
		}
	}

	private updateImage(src: string) {
		this.view.changeImage(src)
	}
}
