$(function () {
  // var globalPictureArray = ['icon-coinflip-sm', 'icon-rock-paper-scissors-sm', 'icon-tic-tac-toe-sm'];
  //Profile pop up add list of icons
  // globalPictureArray.forEach((picture) => {
  //     $('#listCurrentlyPlayingGames').append('<img src="/images/' + picture + '.png">');
  // });


  // add loader to game page blocks  TOP GAMES and AVAILABLE GAMES
  // $('#spinTopGames').addClass('active');
  // $('#spinAvailableGames').addClass('active');
  // setTimeout("$('#spinTopGames').removeClass('active');", 2000);
  // setTimeout("$('#spinAvailableGames').removeClass('active');", 3000);

  // success and error popups edit text
  // var successpopuptext = 'test successpopuptext';
  // var errorpopuptext = 'test errorpopuptext';
  // $('#successpopuptext').html(successpopuptext);
  // $('#errorpopuptext').html(errorpopuptext);

  //test Available Games & Top Games: 1) remove time; 2) move currency symbol on it’s place, add load more cell
  // String.prototype.composetmp = (function () {
  //     var re = /\{{(.+?)\}}/g;
  //     return function (o) {
  //         return this.replace(re, function (_, k) {
  //             return typeof o[k] != 'undefined' ? o[k] : '';
  //         });
  //     }
  // }());

  // var TableGamesTemplateTest = '<li>' +
  //     '<table class="table-games">' +
  //     '<tr>' +
  //     '<th><img src="/images/game-icon-wallet.svg"> Creator:</th>' +
  //     '<td colspan="2">{{id}}</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //     '<th><img src="/images/game-icon-bet.svg"> Bet:</th>' +
  //     '<td><b>{{amount}}</b><img src="/images/game-icon-trh.svg">TRH</td>' +
  //     '<td class="text-right"></td>' +
  //     '</tr>' +
  //     '</table>' +
  //     '</li>';
  // var PendingWithdrawTemplate = '<li>' +
  //     '<table class="table-games">' +
  //     '<tr>' +
  //     '<th>Game ID:</th>' +
  //     '<td>{{id}}</td>' +
  //     '<td rowspan="2"><a class="btn btn-blue btn-small" href="/">Withdraw</a></td>' +
  //     '</tr>' +
  //     '<tr>' +
  //     '<th>Price amount:</th>' +
  //     '<td><b>{{amount}}</b><img src="/images/game-icon-trh.svg">TRH</td>' +
  //     '</tr>' +
  //     '</table>' +
  //     '</li>';

  // var RaffleGamesTemplate = '<li>' +
  //     '<table class="table-games">' +
  //     '<tr>' +
  //     '<td colspan="2">{{address}}</td>' +
  //     '</tr>' +
  //     '<tr>' +
  //     '<td><b>{{amount}}</b><img src="/images/game-icon-trh.svg">TRH</td>' +
  //     '<td class="text-right">{{timeago}}</td>' +
  //     '</tr>' +
  //     '</table>' +
  //     '</li>';
  // var beginitem = 0;
  // var showitem = 6;
  // let topGameIdxs = [0, 1, 2, 3, 4, 5, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];


  // function updateTopGamesTemp1() {
  //     topGameIdxs.forEach((num, index) => {
  //         if (index >= beginitem && index < beginitem + showitem) {
  //             var id = '12745653343406884750023814';
  //             var amount = '0.04250' + index;
  //             var data = '11.11.2019';
  //             $('#BlockReferrals').append(PendingWithdrawTemplate.composetmp({
  //                 'id': id,
  //                 'amount': amount,
  //                 'timeago': data
  //             }));
  //         };
  //     });
  //     beginitem = beginitem + showitem;
  //     if (beginitem > topGameIdxs.length) beginitem = 0;
  // };

  // function updateTopGamesTemp() {
  //     topGameIdxs.forEach((num, index) => {
  //         if (index >= beginitem && index < beginitem + showitem) {
  //             var id = '0xF0CEe1E2C47744ad880547306a45332aDdAb8D54';
  //             var amount = '0.04250' + index;
  //             var data = '11.11.2019';
  //             $('#AvailableGames').append(TableGamesTemplateTest.composetmp({
  //                 'id': id,
  //                 'amount': amount,
  //                 'timeago': data
  //             }));
  //         };
  //     });
  //     beginitem = beginitem + showitem;
  //     if (beginitem > topGameIdxs.length) beginitem = 0;
  // };

  // $('#updateTopGamesTempId').on('click', function () {
  //     updateTopGamesTemp();
  //     //updateTopGamesTemp1();
  // });

  // updateTopGamesTemp();
  //updateTopGamesTemp1();

});

//coinflip buttuns

// function coinflipShowButton(name){
//     coinflipHideAll();
//     $("#"+name).css("display","block");
// }
// function coinflipHideAll(){
//     $("#youwon").css("display","none");
//     $("#youlost").css("display","none");
//     $("#cfstart").css("display","none");
//     $("#cfjoin").css("display","none");
//     $("#cfmaketop").css("display","none");
//     $("#cfpaused").css("display","none");
// }

//coinflip bodys
// // var coinFlipChoiceBtc=0;

// // function coinFlip(name){

// //     if(name=='ethereum'){
// //         coinFlipChoiceBtc=0;
// //         $("#bitcoinFlip").html('<img src="/images/bitcoin-black.svg">');
// //         $("#ethereumFlip").html('<img src="/images/ethereum-orange.svg">');

// //     }
// //     if(name=='bitcoin'){
// //         coinFlipChoiceBtc=1;
// //         $("#bitcoinFlip").html('<img src="/images/bitcoin-orange.svg">');
// //         $("#ethereumFlip").html('<img src="/images/ethereum-black.svg">');

// //     }

// // }


// function coinflipStartGame(){
//     console.log('StartGame');
//     console.log(coinFlipChoiceBtc);
// }

// var coinflipJoinAndPlayBtc=0;
// function coinflipJoinAndPlay(){
//     console.log('JoinGame');
//     console.log(coinflipJoinAndPlayBtc);
// }

// var coinFlipTopBtc=0;
// function makeTopClicked(){
//     console.log('MakeTop');
//     console.log(coinFlipTopBtc);
// }


// function coinflipUpdate(name) {
//     console.log('coinflipUpdate');
// }


// function coinflipQuitGame() {
//     console.log('Quit game');
// }
// function coinflipClaimExpaired() {
//     console.log('Claim expired');
// }

let Spinner = {
raffle: 1,
// pending: 2,  not used
gameView: 3,
availanbleGames: 4,
topGames: 5,
}

function showSpinner(id) {
switch (id) {
  case Spinner.raffle:
    if (!document.getElementById("spinRaffle").classList.contains('active')) {
      document.getElementById("spinRaffle").classList.add('active');
    }
    break;

  // case Spinner.pending:
  //   if (!document.getElementById("spinPending").classList.contains('active')) {
  //     document.getElementById("spinPending").classList.add('active');
  //   }
  //   break;

  case Spinner.gameView:
    if (!document.getElementById("spinStart").classList.contains('active')) {
      document.getElementById("spinStart").classList.add('active');
    }
    break;

  case Spinner.availanbleGames:
    if (!document.getElementById("spinAvailableGames").classList.contains('active')) {
      document.getElementById("spinAvailableGames").classList.add('active');
    }
    break;

  case Spinner.topGames:
    if (!document.getElementById("spinTopGames").classList.contains('active')) {
      document.getElementById("spinTopGames").classList.add('active');
    }
    break;

  default:
    break;
}
}

function hideSpinner(id) {
switch (id) {
  case Spinner.raffle:
    if (document.getElementById("spinRaffle").classList.contains('active')) {
      document.getElementById("spinRaffle").classList.remove('active');
    }
    break;

  // case 2:
  //   if (document.getElementById("spinPending").classList.contains('active')) {
  //     document.getElementById("spinPending").classList.remove('active');
  //   }
  //   break;

  case Spinner.gameView:
    if (document.getElementById("spinStart").classList.contains('active')) {
      document.getElementById("spinStart").classList.remove('active');
    }
    break;

  case Spinner.availanbleGames:
    if (document.getElementById("spinAvailableGames").classList.contains('active')) {
      document.getElementById("spinAvailableGames").classList.remove('active');
    }
    break;
    
  case Spinner.topGames:
    if (document.getElementById("spinTopGames").classList.contains('active')) {
      document.getElementById("spinTopGames").classList.remove('active');
    }
    break;

  default:
    break;
}
}



//  Transaction Notification View
// function showNotifViewWithData(_name, _txn) {
//   $('#notifPrefix').text(_name);
  
//   $('#notifLink').text("");
//   document.getElementById('notifLink').href = "";
//   $('#notifSuffix').text("");
  
  // if (_txn) {
  //   $('#notifLink').text(_txn);
  //   document.getElementById('notifLink').href = "https://etherscan.io/tx/"+_txn;
  //   $('#notifSuffix').text("is being mined...");
  // }
//   $('#notifView').addClass("isVisible");
// }

// function hideAndClearNotifView() {
//   $('#notifPrefix').text("");
//   $('#notifLink').text("");
//   document.getElementById('notifLink').href = "";
//   $('#notifView').removeClass("isVisible");
// }

// function toggleSpinner(id) {
//     switch (id) {
//       case 1:
//         $('#spinRaffle').toggleClass('active');
//         break;
//       case 2:
//         $('#spinPending').toggleClass('active');
//         break;
//       case 3:
//         $('#spinStart').toggleClass('active');
//         break;
//       case 4:
//         $('#spinAvailableGames').toggleClass('active');
//         break;
//       case 5:
//         $('#spinTopGames').toggleClass('active');
//         break;
//       default:
//         break;
//     }
//   }

// rps buttuns

function rpsShowButton(name){
  rpsHideAll();
  document.getElementById(name).classList.remove("display-none");
}
function rpsHideAll(){
document.getElementById("rpsstart").classList.add("display-none");
document.getElementById("rpswfopponent").classList.add("display-none");
document.getElementById("rpswfopponentmove").classList.add("display-none");
document.getElementById("rpsjoingame").classList.add("display-none");
document.getElementById("rpsplaymove").classList.add("display-none");
document.getElementById("rpsmakemove").classList.add("display-none");
document.getElementById("rpsyouopponentlost").classList.add("display-none");
}