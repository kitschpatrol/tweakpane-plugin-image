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

function readImage(exValue: unknown): unknown {
	const { src } = exValue as { src?: unknown }
	if (src !== undefined) {
		return src === '' ? 'placeholder' : src
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
