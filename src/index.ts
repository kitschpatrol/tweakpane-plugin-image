import type {TpPlugin} from 'tweakpane';

import {TweakpaneImagePlugin} from './plugin.js';

export const id = 'input-image';

export const css = '__css__';

export const plugins: TpPlugin[] = [TweakpaneImagePlugin];
