import type { TpPlugin } from 'tweakpane'
import { TweakpaneImagePlugin } from './plugin'
import pluginCss from './styles/plugin.scss?inline'

export const id = 'input-image'

export const css: string = pluginCss

export const plugins: TpPlugin[] = [TweakpaneImagePlugin]

export type { ImageResolvable } from './model'
export type { PluginInputParams } from './plugin'
export { cloneImage, loadImage } from './utils'
