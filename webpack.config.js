const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
	const isLibraryBuild = env.APP_MODE === 'library';

	const commonConfig = {
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
		},
		module: {
			rules: [
				{
					test: /\.(ts|tsx|js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
						},
					},
				},
				// Add this rule for CSS files
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
			],
		},
	};

	if (isLibraryBuild) {
		return {
			...commonConfig,
			entry: './index.ts', // Entry point for the component library
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: 'index.js',
				library: {
					name: 'MyUIComponents',
					type: 'umd', // Universal Module Definition (CJS, AMD, global)
				},
				globalObject: 'this', // For UMD to work correctly in different environments
				clean: true, // Clean the dist folder before each build
				libraryTarget: 'umd', // Legacy, prefer 'library.type'
				umdNamedDefine: true, // Give a name to the AMD module
				auxiliaryComment: 'Button Component Library',
			},
			externals: {
				// Don't bundle React and ReactDOM, expect them to be provided by the consumer
				react: {
					commonjs: 'react',
					commonjs2: 'react',
					amd: 'react',
					root: 'React',
				},
				'react-dom': {
					commonjs: 'react-dom',
					commonjs2: 'react-dom',
					amd: 'react-dom',
					root: 'ReactDOM',
				},
				clsx: {
					commonjs: 'clsx',
					commonjs2: 'clsx',
					amd: 'clsx',
					root: 'clsx',
				},
				'react-hook-form': {
					commonjs: 'react-hook-form',
					commonjs2: 'react-hook-form',
					amd: 'react-hook-form',
					root: 'ReactHookForm',
				},
			},
			optimization: {
				minimize: true,
			},
		};
	} else {
		// Development server for the example app
		return {
			...commonConfig,
			entry: './src/example/index.tsx', // Changed: Entry point for the example app
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: 'bundle.js',
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: path.resolve(__dirname, 'src/example/index.html'), // Changed: Path to your HTML template
				}),
			],
			devServer: {
				static: {
					directory: path.join(__dirname, 'dist'), // The static directory should point to where webpack-dev-server serves files
				},
				compress: true,
				port: 3000,
				open: true,
				hot: true,
			},
			devtool: 'eval-source-map',
		};
	}
};