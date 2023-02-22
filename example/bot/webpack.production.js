const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    clean: true,
    filename: 'bundle.js',
  },
  plugins: [
    new Dotenv({
      path: './prod.env',
      safe: true,
      allowEmptyValues: true,
      systemvars: false,
      silent: false,
      defaults: false,
      prefix: 'process.env.'
    }),
    new CopyPlugin({
      patterns: [
        { from: "manifest.yaml", to: "manifest.yaml" }
      ],
    })
  ]
});
