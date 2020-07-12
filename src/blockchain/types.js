const Types = {
  View: {
    index: "index",
    game: "game"
  },

  Game: {
    cf: "cf",
    rps: "rps"
  },

  SpinnerView: {
    gameView: "gameView",
    availableGames: "availableGames",
    topGames: "TopGames",
    raffle: "raffle",
  },

  BlockchainType: {
    ethereum: "ethereum",
    tron: "tron"
  },

  CF_Move: {
    rock: 0,
    paper: 1,
    scissors: 2
  },

  GameView_CF: {
    start: "cfstart",
    waitingForOpponent: "cfmaketop",
    join: "cfjoin",
    won: "cfWon",
    lost: "cfLost"
  },

  GameState: {
    waitingForOpponent: 0,
    started: 1,
    winnerPresent: 2,
    draw: 3,
    quitted: 4,
    expired:5
  },
}

export default Types;
