import BigNumber from "bignumber.js";

const Utils = {

  //  TODO: delete
  Games: {
    coinFlip: 0,
    rockPaperScissors: 1
  },

  GameState: {
    waitingForOpponent: 0,
    started: 1,
    winnerPresent: 2,
    draw: 3,
    quitted: 4,
    expired:5
  },

  zeroAddress_eth: "0x0000000000000000000000000000000000000000",

  gamesIconsSmall: ['icon-coinflip-sm', 'icon-rock-paper-scissors-sm', 'icon-tic-tac-toe-sm'],

  weiToEtherFixed: (_value, _decimals) => {
    let validatedValue = _value;
    if (typeof validatedValue !== 'string') {
      validatedValue = validatedValue.toString();
    }

    return parseFloat(web3.utils.fromWei(validatedValue, "ether")).toFixed((_decimals) ? _decimals : 5);
  },

  etherToWei: (_value) => {
    let validatedValue = _value;
    if (typeof validatedValue !== 'string') {
      validatedValue = validatedValue.toString();
    }
    // return parseFloat(web3.utils.toWei(validatedValue, "ether"));
    return web3.utils.toWei(validatedValue, "ether");
  },

  addGameIconsToElement: (element, gameIconIds) => {
    gameIconIds.forEach((id) => {
      element.append('<img src="/images/' + Utils.gamesIconsSmall[id] + '.svg">');
    })
  },

  clearElementIcons: (element) => {
    element.empty();
  },

  addressesEqual: (_addr1, _addr2) => {
    if (!_addr1 || !_addr2) {
      return false;
    }
    
    return _addr1.toLowerCase().localeCompare(_addr2.toLowerCase()) == 0;
  },

  gameIconSmallForGame: (_game) => {
    let iconName;
    switch (_game) {
      case Utils.Games.coinFlip:
        iconName = Utils.gamesIconsSmall[0];
        break;
    
      case Utils.Games.rockPaperScissors:
        iconName = Utils.gamesIconsSmall[1];
      default:
        break;
    }

    return iconName;
  },

  asyncForEach: async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },

  getTimeRemaining: function (endtime) {
    let endTimeValidated = endtime*1000;
    // console.log("endTimeValidated:       ", endTimeValidated);
    // console.log("Date.parse(new Date()): ", Date.parse(new Date()));
    var t = endTimeValidated - Date.parse(new Date());
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }
};

export {
  Utils
};