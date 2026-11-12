import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as plugin from '../src/index'
import { TweakpaneImagePlugin } from '../src/plugin'

const source = 'https://example.com/a.png'
const otherSource = 'https://example.com/b.png'
const filePattern = /^blob:.*#a\.png$/u
const droppedFilePattern = /^blob:.*#dropped\.png$/u

function createPng(name = 'a.png'): File {
	return new File(['png'], name, { type: 'image/png' })
}

function createDataTransfer(files: File[] = [], data: Record<string, string> = {}) {
	const store = new Map(Object.entries(data))
	return {
		files,
		getData(format: string) {
			return store.get(format) ?? ''
		},
		setData(format: string, value: string) {
			store.set(format, value)
		},
		setDragImage: vi.fn(),
	}
}

function createDragEvent(type: string, dataTransfer?: ReturnType<typeof createDataTransfer>) {
	const event = new DragEvent(type, { bubbles: true, cancelable: true })
	if (dataTransfer) {
		Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
	}

	return event
}

describe('image plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
		pane = undefined
		vi.restoreAllMocks()
	})

	function setup(value: unknown = 'placeholder', options: Record<string, unknown> = {}) {
		pane ??= new Pane()
		pane.registerPlugin(plugin)
		const params: { value: unknown } = { value }
		const binding = pane.addBinding(params, 'value', { view: 'input-image', ...options })
		const root = binding.element.querySelector<HTMLElement>('.tp-imgv')
		const image = binding.element.querySelector('img')
		const input = binding.element.querySelector('input')
		const placeholder = binding.element.querySelector<HTMLElement>('.tp-imgv_placeholder')
		if (!root || !image || !input || !placeholder) {
			throw new Error('The image view was not created')
		}

		const changes: Array<{ last: boolean; value: unknown }> = []
		binding.on('change', (event) => {
			changes.push({ last: event.last, value: event.value })
		})

		const isImageShown = () =>
			image.style.display === 'block' && placeholder.style.display === 'none'
		const isPlaceholderShown = () =>
			image.style.display === 'none' && placeholder.style.display !== 'none'

		return {
			binding,
			changes,
			image,
			input,
			isImageShown,
			isPlaceholderShown,
			pane,
			params,
			placeholder,
			root,
		}
	}

	it('accepts strings and images with the requested view and valid options', () => {
		expect(TweakpaneImagePlugin.accept('placeholder', { view: 'input-image' })).not.toBeNull()
		const image = new Image()
		expect(TweakpaneImagePlugin.accept(image, { view: 'input-image' })?.initialValue).toBe(image)
		expect(
			TweakpaneImagePlugin.accept('', {
				acceptUrl: true,
				clickCallback() {
					// Accepted as a function
				},
				extensions: ['.webp'],
				imageFit: 'contain',
				view: 'input-image',
			}),
		).not.toBeNull()
		expect(TweakpaneImagePlugin.accept(42, { view: 'input-image' })).toBeNull()
		expect(TweakpaneImagePlugin.accept(null, { view: 'input-image' })).toBeNull()
		expect(TweakpaneImagePlugin.accept(createPng(), { view: 'input-image' })).toBeNull()
		expect(TweakpaneImagePlugin.accept('', {})).toBeNull()
		expect(TweakpaneImagePlugin.accept('', { view: 'text' })).toBeNull()
		expect(TweakpaneImagePlugin.accept('', { imageFit: 'fill', view: 'input-image' })).toBeNull()
		expect(TweakpaneImagePlugin.accept('', { extensions: '.png', view: 'input-image' })).toBeNull()
		expect(
			TweakpaneImagePlugin.accept('', { clickCallback: 'open', view: 'input-image' }),
		).toBeNull()
		expect(TweakpaneImagePlugin.accept('', { acceptUrl: 'yes', view: 'input-image' })).toBeNull()
	})

	it('registers the bundle and installs its compiled styles', () => {
		setup()
		expect(plugin.css).toContain('.tp-imgv')
		expect(plugin.css).not.toContain('@use')
		expect(document.head.textContent).toContain('.tp-imgv')
	})

	it('applies the extensions and image fit params', () => {
		const { image, input } = setup('placeholder', { extensions: ['.webp'], imageFit: 'contain' })
		expect(input.type).toBe('file')
		expect(input.accept).toBe('.webp')
		expect(image.classList.contains('tp-imgv_image_contain')).toBe(true)
	})

	it('uses default extensions and the cover fit', () => {
		const { image, input } = setup()
		expect(input.accept).toBe('.jpg,.png,.gif')
		expect(image.classList.contains('tp-imgv_image_cover')).toBe(true)
	})

	it('shows the placeholder until the image loads', () => {
		const { image, isImageShown, isPlaceholderShown } = setup(source)
		expect(image.getAttribute('src')).toBe(source)
		expect(isPlaceholderShown()).toBe(true)
		image.dispatchEvent(new Event('load'))
		expect(isImageShown()).toBe(true)
	})

	it('shows the placeholder for the placeholder value', () => {
		const { image, isPlaceholderShown } = setup()
		expect(image.hasAttribute('src')).toBe(false)
		expect(isPlaceholderShown()).toBe(true)
	})

	it('keeps the placeholder when a stale load fires after the image was cleared', () => {
		const { binding, image, isImageShown, isPlaceholderShown, params } = setup(source)
		image.dispatchEvent(new Event('load'))
		expect(isImageShown()).toBe(true)

		params.value = 'placeholder'
		binding.refresh()
		expect(isPlaceholderShown()).toBe(true)
		image.dispatchEvent(new Event('load'))
		expect(isPlaceholderShown()).toBe(true)

		params.value = otherSource
		binding.refresh()
		params.value = ''
		binding.refresh()
		image.dispatchEvent(new Event('load'))
		expect(isPlaceholderShown()).toBe(true)
	})

	it('shows each new image once it loads', () => {
		const { binding, image, isImageShown, params } = setup(source)
		params.value = otherSource
		binding.refresh()
		params.value = source
		binding.refresh()
		image.dispatchEvent(new Event('load'))
		expect(image.getAttribute('src')).toBe(source)
		expect(isImageShown()).toBe(true)
	})

	it('reads image sources on refresh and writes them back', () => {
		const { binding, changes, image, params } = setup()
		params.value = { src: source }
		binding.refresh()
		expect(params.value).toBe(source)
		expect(image.getAttribute('src')).toBe(source)
		expect(changes).toEqual([{ last: true, value: source }])
	})

	it('reads a file with an attached source on refresh', () => {
		const { binding, image, params } = setup()
		params.value = Object.assign(createPng(), { src: source })
		binding.refresh()
		expect(params.value).toBe(source)
		expect(image.getAttribute('src')).toBe(source)
	})

	it.each([
		['null', null],
		['undefined', undefined],
		['a blob', new Blob(['png'], { type: 'image/png' })],
		['a number', 42],
		['an object without a source', { url: source }],
	])('keeps %s unchanged on refresh and shows the placeholder', (_label, value) => {
		const { binding, image, isPlaceholderShown, params } = setup(source)
		image.dispatchEvent(new Event('load'))
		params.value = value
		binding.refresh()
		expect(params.value).toBe(value)
		expect(isPlaceholderShown()).toBe(true)
	})

	it('writes a file chosen with the file input as an image', () => {
		const { changes, image, input, params } = setup()
		const file = createPng()
		input.files = Object.assign(new FileList(), [file])
		input.dispatchEvent(new Event('change', { bubbles: true }))
		expect(params.value).toBeInstanceOf(HTMLImageElement)
		const written = params.value as HTMLImageElement
		expect(written.src).toMatch(filePattern)
		expect(written.crossOrigin).toBe('anonymous')
		expect(file).toHaveProperty('src', written.src)
		expect(image.src).toBe(written.src)
		expect(changes).toEqual([{ last: true, value: written }])
	})

	it('ignores a file input change without files', () => {
		const { changes, input, params } = setup()
		input.files = new FileList()
		input.dispatchEvent(new Event('change', { bubbles: true }))
		expect(params.value).toBe('placeholder')
		expect(changes).toEqual([])
	})

	it('toggles the dragging state while dragging over the image', () => {
		const { root } = setup()
		const dragOver = createDragEvent('dragover')
		root.dispatchEvent(dragOver)
		expect(dragOver.defaultPrevented).toBe(true)
		expect(root.classList.contains('tp-imgv_area_dragging')).toBe(true)
		root.dispatchEvent(createDragEvent('dragleave'))
		expect(root.classList.contains('tp-imgv_area_dragging')).toBe(false)
	})

	it('writes a dropped file as an image and clears the dragging state', () => {
		const { params, root } = setup()
		root.dispatchEvent(createDragEvent('dragover'))
		const drop = createDragEvent('drop', createDataTransfer([createPng('dropped.png')]))
		root.dispatchEvent(drop)
		expect(drop.defaultPrevented).toBe(true)
		expect(params.value).toBeInstanceOf(HTMLImageElement)
		expect((params.value as HTMLImageElement).src).toMatch(droppedFilePattern)
		expect(root.classList.contains('tp-imgv_area_dragging')).toBe(false)
	})

	it('writes a dropped URL as an image', () => {
		const { image, params, root } = setup()
		root.dispatchEvent(createDragEvent('drop', createDataTransfer([], { url: source })))
		expect(params.value).toBeInstanceOf(HTMLImageElement)
		expect((params.value as HTMLImageElement).src).toBe(source)
		expect(image.getAttribute('src')).toBe(source)
	})

	it('copies an image dragged from another image binding', () => {
		const first = setup(source)
		const second = setup()
		const dataTransfer = createDataTransfer()
		first.image.dispatchEvent(createDragEvent('dragstart', dataTransfer))
		expect(dataTransfer.getData('img-id')).toBe(first.image.id)
		expect(dataTransfer.setDragImage).toHaveBeenCalledWith(first.image, 0, 0)

		second.root.dispatchEvent(createDragEvent('drop', dataTransfer))
		expect(second.params.value).toBe(first.image)
		expect(second.image.getAttribute('src')).toBe(source)
	})

	it('falls back to the dropped URL when the dragged image is not in this document', () => {
		const { params, root } = setup()
		const dataTransfer = createDataTransfer([], { 'img-id': 'missing-image', url: source })
		root.dispatchEvent(createDragEvent('drop', dataTransfer))
		expect(params.value).toBeInstanceOf(HTMLImageElement)
		expect((params.value as HTMLImageElement).src).toBe(source)
	})

	it('logs drops of an unreachable dragged image without a URL and keeps the value', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
			// Keep the expected error out of the test output
		})
		const { changes, params, root } = setup()
		const dataTransfer = createDataTransfer([], { 'img-id': 'missing-image' })
		root.dispatchEvent(createDragEvent('drop', dataTransfer))
		expect(params.value).toBe('placeholder')
		expect(changes).toEqual([])
		expect(consoleError).toHaveBeenCalledTimes(1)
	})

	it('logs drops without an image and keeps the value', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
			// Keep the expected errors out of the test output
		})
		const { changes, params, root } = setup()
		root.dispatchEvent(createDragEvent('dragover'))
		root.dispatchEvent(createDragEvent('drop', createDataTransfer()))
		root.dispatchEvent(createDragEvent('drop'))
		expect(params.value).toBe('placeholder')
		expect(changes).toEqual([])
		expect(consoleError).toHaveBeenCalledTimes(2)
		expect(root.classList.contains('tp-imgv_area_dragging')).toBe(false)
	})

	it('opens the file picker when the image area is clicked', () => {
		const { image, input, placeholder } = setup()
		const pickerClicks = vi.fn<(event: Event) => void>()
		input.addEventListener('click', pickerClicks)
		placeholder.click()
		image.click()
		expect(pickerClicks).toHaveBeenCalledTimes(2)
	})

	it('calls the click callback instead of opening the file picker', () => {
		const clickCallback = vi.fn()
		const { image, input, placeholder } = setup('placeholder', { clickCallback })
		const pickerClicks = vi.fn<(event: Event) => void>()
		input.addEventListener('click', pickerClicks)
		placeholder.click()
		image.click()
		expect(clickCallback).toHaveBeenCalledTimes(2)
		expect(clickCallback).toHaveBeenCalledWith(expect.any(MouseEvent), input)
		expect(pickerClicks).not.toHaveBeenCalled()
	})

	it('inherits the pane disabled state', () => {
		const { pane: currentPane, root } = setup()
		currentPane.disabled = true
		expect(root.classList.contains('tp-v-disabled')).toBe(true)
		currentPane.disabled = false
		expect(root.classList.contains('tp-v-disabled')).toBe(false)
	})

	it('removes listeners when the binding is disposed', () => {
		const { binding, input, params, root } = setup()
		binding.dispose()
		input.files = Object.assign(new FileList(), [createPng()])
		input.dispatchEvent(new Event('change', { bubbles: true }))
		root.dispatchEvent(createDragEvent('dragover'))
		root.dispatchEvent(createDragEvent('drop', createDataTransfer([], { url: source })))
		expect(params.value).toBe('placeholder')
		expect(root.classList.contains('tp-imgv_area_dragging')).toBe(false)
		expect(binding.element.isConnected).toBe(false)
	})
})
