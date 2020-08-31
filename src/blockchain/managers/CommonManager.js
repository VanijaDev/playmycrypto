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
  }
}

window.CommonManager = CommonManager;

export default CommonManager;