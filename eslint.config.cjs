module.exports = [
	...require('@vanilla-bean/components/eslint.app.config.cjs'),
	{
		// The page logs to its own on-screen console
		rules: {
			'no-console': 'off',
		},
	},
];
