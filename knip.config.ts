import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	entry: ['demo/index.html'],
	ignoreDependencies: [
		'@kitschpatrol/chagent', // Invoked through bumpp's --execute argument.
		'@tsdown/css', // Discovered by tsdown when CSS imports are present.
		'stylelint-config-standard-scss', // Loaded through the shared Stylelint configuration factory.
	],
})
