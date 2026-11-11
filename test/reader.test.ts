import { BindingTarget } from '@tweakpane/core'
import { describe, expect, it } from 'vitest'
import { TweakpaneImagePlugin } from '../src/plugin'

const read = TweakpaneImagePlugin.binding.reader({
	initialValue: 'placeholder',
	params: { view: 'input-image' },
	target: new BindingTarget({ value: 'placeholder' }, 'value'),
})

const source = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

describe('image binding reader', () => {
	it('resolves objects with a string source to that source', () => {
		expect(read({ src: source })).toBe(source)
		const image = new Image()
		image.src = source
		expect(read(image)).toBe(source)
		expect(read(Object.assign(new File(['image'], 'sample.gif'), { src: source }))).toBe(source)
	})

	it('resolves objects with an empty source to the placeholder', () => {
		expect(read({ src: '' })).toBe('placeholder')
		expect(read(new Image())).toBe('placeholder')
	})

	it('passes strings and files through', () => {
		expect(read(source)).toBe(source)
		expect(read('')).toBe('')
		expect(read('placeholder')).toBe('placeholder')
		const file = new File(['image'], 'sample.gif', { type: 'image/gif' })
		expect(read(file)).toBe(file)
	})

	it('passes values it cannot display through unchanged', () => {
		expect(read(null)).toBeNull()
		expect(read(undefined)).toBeUndefined()
		expect(read(42)).toBe(42)
		const blob = new Blob(['image'], { type: 'image/gif' })
		expect(read(blob)).toBe(blob)
		const withoutSource = { url: source }
		expect(read(withoutSource)).toBe(withoutSource)
		const withNumericSource = { src: 1 }
		expect(read(withNumericSource)).toBe(withNumericSource)
	})
})
