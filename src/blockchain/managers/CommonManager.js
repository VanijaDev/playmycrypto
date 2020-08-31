import Types from '../types'
import $ from "../../../public/jquery.min"

const CommonManager = {

  currentView: -1,
  currentGameId: 0,

  setCurrentView: function (_viewType) {
    this.currentView = _viewType;
  },

  setCurrentGameId: function (_currentGameId) {
    console.log("setCurrentGameId: ", _currentGameId);
    this.currentGameId = _currentGameId;
  },

  resetCurrentGameId: function () {
    this.currentGameId = 0;
  },

  showSpinner: function (_viewType) {
    let spinnerView = this.spinnerViewForType(_viewType);

    if (!$("#" + spinnerView)[0].classList.contains('loader')) {
      $("#" + spinnerView).addClass('loader').append('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
    }
  },
  hideSpinner: function (_viewType) {
    let spinnerView = this.spinnerViewForType(_viewType);

    if ($("#" + spinnerView)[0].classList.contains('loader')) {
      $("#" + spinnerView).removeClass('loader').find('.lds-ring').remove()
    }
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
        view = "TopGames";
        break;

      case Types.SpinnerView.raffle:
        view = "raffleBlock";
        break;

      case Types.SpinnerView.beneficiary:
        view = "beneficiaryBlock";
        break;

      default:
        throw("Error in spinnerViewForType");
    }

    return view;
  }
}

window.CommonManager = CommonManager;

export default CommonManager;