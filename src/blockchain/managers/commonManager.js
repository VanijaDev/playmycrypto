import Types from '../types'
import $ from "../../../public/jquery.min"

const CommonManager = {
  currentView: null,

  setCurrentView: function (_viewType) {
    this.currentView = _viewType;
  },

  isCurrentView: function(_viewType) {
    return _viewType.localeCompare(this.currentView) == 0;
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


//  Extensions
//  Array
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});