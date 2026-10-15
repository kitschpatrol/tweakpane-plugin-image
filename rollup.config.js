/* eslint-env node */

import {nodeResolve} from '@rollup/plugin-node-resolve';
import Replace from '@rollup/plugin-replace';
import Typescript from '@rollup/plugin-typescript';
import Autoprefixer from 'autoprefixer';
import Postcss from 'postcss';
import Cleanup from 'rollup-plugin-cleanup';
import terser from '@rollup/plugin-terser';
import {compile as sassCompile} from 'sass';
import {fileURLToPath} from 'node:url';

const sassEntry = 'src/sass/plugin.scss';

async function compileCss() {
	const compiled = sassCompile(sassEntry, {
		style: 'compressed',
		silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
	});

	const result = await Postcss([Autoprefixer]).process(compiled.css, {
		from: undefined,
	});
	return {
		css: result.css.replace(/'/g, "\\'").trim(),
		files: compiled.loadedUrls.map((url) => fileURLToPath(url)),
	};
}

function getPlugins(shouldMinify) {
	let css = '';
	let sassFiles = [sassEntry];
	const plugins = [
		{
			// Recompiles Sass on every build so watch mode picks up stylesheet edits
			name: 'compile-css',
			async buildStart() {
				// Watch the last known files first so a Sass error stays recoverable
				for (const sassFile of sassFiles) this.addWatchFile(sassFile);
				({css, files: sassFiles} = await compileCss());
				for (const sassFile of sassFiles) this.addWatchFile(sassFile);
			},
			transform(code) {
				// Make the Sass files transform dependencies of the module that inlines the CSS,
				// so watch mode re-transforms it (re-running Replace) when a stylesheet changes
				if (code.includes('__css__')) {
					for (const sassFile of sassFiles) this.addWatchFile(sassFile);
				}
				return null;
			},
		},
		Typescript({
			tsconfig: 'src/tsconfig.json',
		}),
		nodeResolve(),
		Replace({
			__css__: () => css,
			preventAssignment: false,
		}),
	];
	if (shouldMinify) {
		plugins.push(terser());
	}
	return [
		...plugins,
		// https://github.com/microsoft/tslib/issues/47
		Cleanup({
			comments: 'none',
		}),
	];
}

export default async () => {
	const production = process.env.BUILD === 'production';
	const postfix = production ? '.min' : '';

	const distName = 'tweakpane-plugin-image';
	return {
		input: 'src/index.ts',
		external: ['tweakpane', '@tweakpane/core'],
		output: {
			file: `dist/${distName}${postfix}.js`,
			format: 'esm',
		},
		plugins: getPlugins(production),

		// Suppress `Circular dependency` warning
		onwarn(warning, rollupWarn) {
			if (warning.code === 'CIRCULAR_DEPENDENCY') {
				return;
			}
			rollupWarn(warning);
		},
	};
};
