import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default (env) => {
	const isLibraryBuild = env.APP_MODE === 'library';
	const isExampleBuild = env.APP_MODE === 'example';

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
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {
								importLoaders: isExampleBuild ? 1 : 0,
							},
						},
						...(isExampleBuild ? [
							{
								loader: 'postcss-loader',
								options: {
									postcssOptions: {
										plugins: [
											'@tailwindcss/postcss'
										],
									},
								},
							}
						] : []),
					],
				},
			],
		},
	};

	if (isLibraryBuild) {
		return {
			...commonConfig,
			entry: './index.ts',
			experiments: {
				outputModule: true,
			},
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: 'index.js',
				library: {
					type: 'module',
				},
				clean: false, // Don't clean - preserve TypeScript declarations
			},
			externalsType: 'module',
			externals: ['react', 'react-dom', 'react-router-dom', 'clsx', 'tailwindcss', 'postcss', 'postcss-loader', '@tailwindcss/postcss', 'react-hook-form', 'lucide-react', '@tanstack/react-table'],
			optimization: {
				minimize: true,
			},
		};
	} else {
		// Development server for the example app
		return {
			...commonConfig,
			entry: './src/example/index.tsx',
			output: {
				path: path.resolve(__dirname, 'dist'),
				filename: 'bundle.js',
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: path.resolve(__dirname, 'src/example/index.html'),
				}),
			],
			devServer: {
				static: {
					directory: path.join(__dirname, 'dist'),
				},
				compress: true,
				port: 3001,
				open: true,
				hot: true,
				historyApiFallback: true,
			},
			devtool: 'eval-source-map',
		};
	}
};
