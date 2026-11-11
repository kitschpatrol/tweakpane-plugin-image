import type { BaseInputParams, BindingTarget, InputBindingPlugin } from '@tweakpane/core'
import { createPlugin, parseRecord } from '@tweakpane/core'
import type { ImageResolvable } from './model'
import { PluginController } from './controller'

export type PluginInputParams = {
	clickCallback?: (event: MouseEvent, input: HTMLInputElement) => void
	extensions?: string[]
	imageFit?: 'contain' | 'cover'
	view: 'input-image'
} & BaseInputParams

const DEFAULT_EXTENSIONS = ['.jpg', '.png', '.gif']

/**
 * Objects with a string `src`, such as images from another window or files with
 * an attached URL, resolve to that source, or to `'placeholder'` when it is
 * empty. Any other value passes through unchanged, so a refresh never rewrites
 * a value the plugin cannot display.
 */
function readImage(exValue: unknown): unknown {
	if (
		typeof exValue === 'object' &&
		exValue !== null &&
		'src' in exValue &&
		typeof exValue.src === 'string'
	) {
		return exValue.src === '' ? 'placeholder' : exValue.src
	}

	return exValue
}

function writeImage(target: BindingTarget, inValue: unknown): void {
	target.write(inValue)
}

export const TweakpaneImagePlugin: InputBindingPlugin<unknown, ImageResolvable, PluginInputParams> =
	createPlugin({
		accept(exValue: unknown, params: Record<string, unknown>) {
			if (typeof exValue !== 'string' && !(exValue instanceof HTMLImageElement)) {
				return null
			}

			const result = parseRecord<PluginInputParams>(params, (p) => ({
				acceptUrl: p.optional.boolean,
				clickCallback: p.optional.custom<PluginInputParams['clickCallback']>((callback) =>
					typeof callback === 'function'
						? (callback as NonNullable<PluginInputParams['clickCallback']>)
						: undefined,
				),
				extensions: p.optional.array(p.required.string),
				imageFit: p.optional.custom((v) => (v === 'contain' || v === 'cover' ? v : undefined)),
				view: p.required.constant('input-image'),
			}))
			if (!result) {
				return null
			}

			return {
				initialValue: exValue,
				params: result,
			}
		},
		binding: {
			reader(_args) {
				return readImage
			},
			writer(_args) {
				return writeImage
			},
		},
		controller(args) {
			return new PluginController(args.document, {
				clickCallback: args.params.clickCallback,
				extensions: args.params.extensions ?? DEFAULT_EXTENSIONS,
				imageFit: args.params.imageFit ?? 'cover',
				value: args.value,
				viewProps: args.viewProps,
			})
		},
		id: 'input-image',
		type: 'input',
	})
