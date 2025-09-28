const isExample = process.env.APP_MODE === 'example';
export default {
	plugins: isExample
		? {
			"@tailwindcss/postcss": {},
		}
		: {},
};