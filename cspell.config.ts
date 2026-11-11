import { cspellConfig } from '@kitschpatrol/cspell-config'

export default cspellConfig({
	// Chagent generates the changelog.
	ignorePaths: ['**/changelog.md'],
	words: ['chagent', 'imgv', 'tpimg'],
})
