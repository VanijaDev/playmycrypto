const TicTacToeGame = artifacts.require("TicTacToeGame");

module.exports = function (deployer) {
    const PARTNER = "0xcF2023CC5E75E2937ca0820145C371cfE07b946c";
    deployer.deploy(TicTacToeGame, PARTNER);
};