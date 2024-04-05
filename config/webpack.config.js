'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const ZipPlugin = require('zip-webpack-plugin');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
    leaflet: PATHS.src + '/leaflet.js',
    loadMap: PATHS.src + '/loadMap.js',
    common: PATHS.src + '/common.js',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
    ],
  },
  plugins:[
    new ZipPlugin({
      filename: 'Willhaben-ImmoMap.zip',
      path: './', // Output directory where the zip file will be placed
    }),
  ]
});

module.exports = config;
