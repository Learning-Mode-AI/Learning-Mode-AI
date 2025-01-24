const path = require('path');

module.exports = {
  mode: 'development',
  entry: './js/content.js',
  output: {
    filename: 'content.bundle.js', // Name of the JavaScript bundle
    path: path.resolve(__dirname, 'js'), // Output directory
    publicPath: '/js/', // Public URL for assets
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Process JavaScript and JSX files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i, // Process CSS files
        use: [
          'style-loader', // Inject CSS into the DOM
          {
            loader: 'css-loader', // Resolve url() paths in CSS
            options: { url: true }, // Enable URL resolution
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i, // Process image files
        type: 'asset/resource', // Copy image files to the output folder
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Automatically resolve file extensions
  },
};
