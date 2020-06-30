const CoinFlipGame = artifacts.require("CoinFlipGame");

module.exports = function (deployer, network, accounts) {
    deployer.deploy(CoinFlipGame, accounts[5]);
};