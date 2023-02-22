const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    client: {
      logging: 'info',
      overlay: true,
    },
    compress: true,
    open: true,
    static: './build',
  },
  stats: {
    errorDetails: true,
  },
  plugins: [
    new Dotenv({
      path: './dev.env',
      safe: true,
      allowEmptyValues: true,
      systemvars: false,
      silent: false,
      defaults: false,
      prefix: 'process.env.'
    })
  ]
});
