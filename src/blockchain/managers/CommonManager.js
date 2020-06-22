import Types from '../types'

const CommonManager = {

  currentView: -1,
  currentGame: -1,

  setCurrentView: function (_viewType) {
    this.currentView = _viewType;
  },

  setCurrentGame: function (_gameType) {
    this.currentGame = _gameType;
  },


  showSpinner: function (_viewType) {
    let spinnerView = this.spinnerViewForType(_viewType);
    window.showSpinner(spinnerView);
  },
  hideSpinner: function (_viewType) {
    let spinnerView = this.spinnerViewForType(_viewType);
    window.hideSpinner(spinnerView);
  },
  spinnerViewForType: function (_viewType) {
    let view = null;

    switch (_viewType) {
      case Types.SpinnerView.gameView:
        view = "gameBlock";
        break;

      case Types.SpinnerView.availableGames:
        view = "AvailableGames";
        break;

      case Types.SpinnerView.topGames:
        view = "BlockTopGames";
        break;

      case Types.SpinnerView.raffle:
        view = "raffleBlock";
        break;
    
      default:
        break;
    }

    return view;
  }

}

export default CommonManager;