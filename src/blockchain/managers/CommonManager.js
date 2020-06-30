import Types from '../types'
import $ from "../../../public/jquery.min"

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
        view = "topGamesBlock";
        break;

      case Types.SpinnerView.raffle:
        view = "raffleBlock";
        break;

      default:
        break;
    }

    return view;
  },

  showBackTimer: function (duration, callback = null) {
    setTimeout(function () {
      $('.timer-block').addClass('visible');
    }, 1000);

    var timer = duration, minutes, seconds;
    var backInterval = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      $('#timerBack').text(minutes + " min " + seconds + " sec");
      if (--timer < 0) {
        clearInterval(backInterval);
        $('.timer-block').removeClass('visible');
        console.log('Timer end');

        if (callback) {
          callback();
        }
      }
    }, 1000);
  },

  hideBackTimer: function () {
    if ($('.timer-block')[0].classList.contains('visible')) {
      $('.timer-block').removeClass('visible');
    }
  }
}

export default CommonManager;
