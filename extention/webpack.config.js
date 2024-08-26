const path = require('path');

module.exports = {
  mode: 'development',
  entry: './js/content.js',
  output: {
    filename: 'content.bundle.js',
    path: path.resolve(__dirname, 'js')
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
