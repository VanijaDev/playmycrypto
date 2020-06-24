const path = require("path");

var config = {
  // TODO: Add common Configuration
  module: {},
  mode: "development",
};

var mainConfig = Object.assign({}, config, {
  name: "index",
  entry: "./src/blockchain/index.js",
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'public'),
  },
});

var gameConfig = Object.assign({}, config, {
  name: "game",
  entry: "./src/blockchain/game.js",
  output: {
    filename: 'game.js',
    path: path.resolve(__dirname, 'public'),
  },
});

var coinFlipConfig = Object.assign({}, config, {
  name: "coinFlip",
  entry: "./src/blockchain/gameView/coinFlip.js",
  output: {
    filename: 'coinFlip.js',
    path: path.resolve(__dirname, 'public'),
  },
});

// var plugins = [
//   new webpack.ProvidePlugin({
//     $: "public/jquery.min.js",
//   })
// ];

// Return Array of Configurations
module.exports = [
  mainConfig,
  gameConfig,
  coinFlipConfig,
  // plugins
];