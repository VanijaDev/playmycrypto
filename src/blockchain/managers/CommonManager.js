const CommonManager = {

  currentView: -1,
  currentGame: -1,

  setCurrentView: function (_viewType) {
    this.currentView = _viewType;
  },

  setCurrentGame: function (_gameType) {
    this.currentGame = _gameType;
  }
}

export default CommonManager;