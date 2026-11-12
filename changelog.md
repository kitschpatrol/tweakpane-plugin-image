# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1-fork.2] - 2026-11-11

### Added

- Export `ImageResolvable`, `PluginInputParams` with typed click callbacks, and the `loadImage` and `cloneImage` helpers from the package entry.
- Add a `/lite` entry and minified lite build that keep `@tweakpane/core` external for sharing across plugins.

### Changed

- Bundle `@tweakpane/core` in the default builds and mark the package as side-effect-free for tree shaking.
- **Breaking:** Restrict package imports to the root, `/lite`, and `/package.json`, blocking other deep imports and replacing `dist/types` with one bundled declaration file.
- **Breaking:** Raise the browser JavaScript target from ES6 to ES2022.
- **Breaking:** Drop declared support for Node.js 19, 21, 23, and 25.

### Fixed

- Preserve `null`, `undefined`, and unsupported values on binding refresh, showing the placeholder instead of throwing or rewriting the value.
- Keep the placeholder visible when a stale image load event fires after the binding is cleared.
- Fall back to the dropped URL when a dragged image cannot be found in the current document, logging an error and preserving the value when no URL is available.

### Documentation

- Expand the README with installation and usage examples, `/lite` dependency guidance, public exports, contribution instructions, and clarified upstream and template attribution.

### Maintenance

- Update the project's pnpm version to 12.16.1.
- Update the GitHub release-note and release actions.
- Switch scripted npm publishing to a one-time password retrieved through the 1Password CLI.
- Replace Rollup and separate Sass and declaration scripts with tsdown, add publint and Are the Types Wrong package checks, and remove automatic installation builds and versioned ZIP packaging scripts.
- Adopt `@kitschpatrol/shared-config` and `ksc` for shared linting and formatting, with editor integration.
- Move the interactive demo to Vite with live reloading.
- Add Vitest and happy-dom tests for plugin registration, styles, binding refreshes, file selection, drag and drop, callbacks, and disposal.
- Add CI builds, linting, and tests on Linux, macOS, and Windows.
- Automate monthly and manually triggered dependency-update pull requests with `ksc-update`.
- Generate changelogs with `chagent` during versioning and build the versioned package before publishing.
- Refresh development dependencies, upgrade pnpm to 12.18.0, and update CI, repository metadata, and Fork Tender actions.

## [2.0.1-fork.1] - 2026-10-15

### Documentation

- Refresh README links and upstream package information, explain fork-suffixed versioning, and expand MIT-license attribution.

### Maintenance

- Upgrade to pnpm 12, TypeScript 6, and ESLint 10 with flat configuration, declaring `^24.16.0 || >=26.3.0` Node.js versions for development.
- Standardize pnpm build and format scripts, use shx for cleanup, add deep cleanup, and automate README generation and validation with mdat.
- Use the modern Sass compiler API and Rollup watch mode to rebuild embedded styles after stylesheet changes and recover from Sass errors.
- Update release scripting to test and build before versioning and publish releases with a `fork` prerelease identifier.
- Add automated repository and website link checks on pushes, pull requests, and a weekly schedule.
- Add scheduled Fork Tender automation for maintaining the upstream forks.
- Refresh GitHub release and metadata workflows with pinned actions and release-tag validation against the default branch.

## [2.0.1-beta.8] - 2025-10-07

### Fixed

- Prevent layout shifts while images load by reserving preview height and retaining the initial placeholder; clip previews to the control's rounded corners.

### Maintenance

- Extend the browser test page with random image loading and pane refresh to exercise loading transitions.

## [2.0.1-beta.7] - 2025-10-07

### Changed

- Render empty images with a clickable HTML placeholder that inherits Tweakpane theme colors and fonts instead of an SVG image.

### Maintenance

- Refresh build, TypeScript, formatting, and pnpm dependencies, adding `tslib` to the development toolchain.
- Upgrade the GitHub metadata synchronization action to v3 and simplify its workflow.

## [2.0.1-beta.6] - 2025-03-04

### Maintenance

- Switch the release script from npm's `beta` tag to `latest`.

## [2.0.1-beta.5] - 2025-03-04

### Documentation

- Correct the package repository URL and clarify that beta versions track the next upstream patch release.

### Maintenance

- Update the `@tweakpane/core` runtime requirement to `^2.0.5`.
- Refresh development dependencies, adopt pnpm 10, remove the pnpm engine restriction, and configure permitted dependency build scripts.
- Set the release script to publish under npm's `beta` tag and update GitHub release and metadata workflows.

## [2.0.1-beta.4] - 2024-09-15

### Maintenance

- Remove the redundant nested package directory and its duplicated manifest, README, and license.

## [2.0.1-beta.3] - 2024-09-15

### Changed

- Relax the Tweakpane peer requirement from `^4.0.4` to `^4.0.0`.

## [2.0.1-beta.2] - 2024-09-15

### Fixed

- Preserve the return value of `clickCallback` in the preview's click handler.

### Maintenance

- Update build tooling to `@rollup/plugin-terser` and glob 11, and adjust asset scripts and supporting development dependencies.

## [2.0.1-beta.1] - 2024-09-15

### Changed

- **Breaking:** Migrate to Tweakpane 4 with a `^4.0.4` peer requirement, replacing the `plugin` export with `id`, `css`, and `plugins`.
- **Breaking:** Rename the npm package to `@kitschpatrol/tweakpane-plugin-image`.
- **Breaking:** Declare native ESM packaging, rename bundles to `tweakpane-plugin-image.js` and `tweakpane-plugin-image.min.js`, and move declarations to `dist/types`.
- **Breaking:** Externalize `@tweakpane/core` as a `^2.0.4` runtime dependency, requiring bundler resolution or an import map for direct browser imports.
- Restyle the empty-image placeholder as a gray monospace “No Image” label.

### Removed

- Stop including TypeScript sources and source maps in the published package.

### Documentation

- Document the scoped fork, dependency externalization, import maps, and beta versioning, and migrate browser examples to Tweakpane 4 `addBinding`.

### Maintenance

- Adopt pnpm and refresh the Rollup, TypeScript, Sass, and lint/format toolchain, declaring Node.js 18+ and pnpm 9+ engines.
- Add a declaration-only build and local demo server, and update asset scripts for ESM execution.
- Add scripted npm publishing, replace GitHub release automation, and synchronize repository metadata from package.json.

## [1.1.404] - 2023-08-11

### Added

- Support dragging image elements between plugin controls.

### Changed

- **Breaking:** Switch distributed bundles from UMD to ES modules and emit JavaScript source maps.
- **Breaking:** Update bound image values synchronously instead of waiting for images to finish loading.

### Removed

- **Breaking:** Remove the fallback that preserved imported files as `File` values when image decoding failed.

### Fixed

- Resolve Tweakpane version compatibility by declaring `@tweakpane/core` 1.1.8 as a pinned production dependency.
- Remove drag-and-drop listeners from the correct element when a control is disposed.

## [1.1.403] - 2023-05-28

### Maintenance

- Install dependencies with `npm ci` before packing GitHub release assets.

## [1.1.402] - 2023-05-28

### Fixed

- Handle `canvas.toBlob()` returning `null` when generating placeholder images.

### Maintenance

- Update development dependencies, including TypeScript 5, rimraf 5, and Tweakpane 3.1.9, and enable npm lockfile generation.

## [1.1.401] - 2023-05-28

### Added

- Accept image URL strings and the `'placeholder'` sentinel as binding values, with a placeholder for empty images.
- Add drag and drop of local files and image URLs, with a configurable `--tp-plugin-image-dragging-color` highlight.
- Add `imageFit` options for `contain` and `cover` preview scaling.
- Add `clickCallback(event, input)` to customize clicks on image previews.
- Support custom file formats with a `File` fallback when decoding fails, and preserve filenames in imported blob URLs.
- Ship TypeScript declarations and source files with the npm package.

### Changed

- **Breaking:** Require `view: 'input-image'` when creating image bindings.
- **Breaking:** Change `extensions` from a comma-separated string to a string array, defaulting to `['.jpg', '.png', '.gif']`.
- **Breaking:** Rename bundles to `dist/index.js` and `dist/index.min.js`, and change the UMD global to `IndexPlugin`.
- **Breaking:** Request preview images with anonymous CORS, requiring cross-origin image servers to permit those requests.
- Size previews to their image content within a maximum height and add rounded corners.

### Documentation

- Update npm installation instructions and document URL, placeholder, and image-fit usage, with a linked demo and screenshot.

### Maintenance

- Make cleanup, watch, and lint commands work across Windows and Unix.
- Replace node-sass with Dart Sass and refresh Tweakpane build dependencies.
- Add a tag-triggered GitHub release workflow that packages an npm tarball as a release asset.

## [1.0.1] - 2021-07-20

### Added

- Introduce the `plugin` export for Tweakpane 3 image bindings, with previews, configurable file extensions, and a picker that returns loaded `HTMLImageElement` values.
- Distribute `tweakpane-image-plugin` as regular and minified UMD browser bundles with embedded styles.

### Documentation

- Document GitHub installation, plugin registration, image bindings, extension filtering, and change handlers.

### Maintenance

- Set up TypeScript/Rollup builds, linting and formatting, browser testing, watch commands, and versioned release archives.

[1.0.1]: https://github.com/kitschpatrol/tweakpane-plugin-image/releases/tag/v1.0.1
[1.1.401]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/v1.0.1...v1.1.401
[1.1.402]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/v1.1.401...v1.1.402
[1.1.403]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/v1.1.402...v1.1.403
[1.1.404]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/v1.1.403...v1.1.404
[2.0.1-beta.1]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/v1.1.404...2.0.1-beta.1
[2.0.1-beta.2]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.1...2.0.1-beta.2
[2.0.1-beta.3]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.2...2.0.1-beta.3
[2.0.1-beta.4]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.3...2.0.1-beta.4
[2.0.1-beta.5]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.4...2.0.1-beta.5
[2.0.1-beta.6]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.5...2.0.1-beta.6
[2.0.1-beta.7]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.6...2.0.1-beta.7
[2.0.1-beta.8]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.7...2.0.1-beta.8
[2.0.1-fork.1]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-beta.8...2.0.1-fork.1
[2.0.1-fork.2]: https://github.com/kitschpatrol/tweakpane-plugin-image/compare/2.0.1-fork.1...2.0.1-fork.2
