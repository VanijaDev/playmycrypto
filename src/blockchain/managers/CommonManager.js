import Types from '../types'

const CommonManager = {

  currentView: -1,
  currentGame: -1,
  currentSpinnerView: null,

  setCurrentView: function (_viewType) {
    this.currentView = _viewType;
  },

  setCurrentGame: function (_gameType) {
    this.currentGame = _gameType;
  },


  showSpinner: function (_viewType) {
    this.currentSpinnerView = this.spinnerViewForType(_viewType);
    window.showSpinner(this.currentSpinnerView);
  },
  hideSpinner: function () {
    window.hideSpinner(this.currentSpinnerView);
    this.currentSpinnerView = null;
  },
  spinnerViewForType: function (_viewType) {
    let view = null;

    switch (_viewType) {
      case Types.SpinnerView.gameView:
        view = "gameBlock";
        break;
    
      default:
        break;
    }


    return view;
  }

}

export default CommonManager;