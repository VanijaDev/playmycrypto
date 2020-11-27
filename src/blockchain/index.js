import Utils from "./utils";
import BigNumber from "bignumber.js";
import Types from "./types";

const $t = $('#translations').data();

const Index = {
  timer: null,

  // ProfileManager handler methods
  pendingWithdrawn: async function () {
    window.Index.update();
  },

  setup: async function () {
    console.log('%c index - setup', 'color: #00aa00');

    await window.ProfileManager.setUpdateHandler(window.Index);
    await window.ProfileManager.update();
    await window.Index.update();

    window.Index.timer = setInterval(function () {
      window.Index.update();
      window.ProfileManager.update();
    }, 10000);
  },

  onUnload: function () {
    console.log('%c index - onUnload', 'color: #00aa00');
    
    if (window.Index.timer) {
      clearInterval(window.Index.timer);
    }

    window.window.ProfileManager.setUpdateHandler(null);
    hideTopBannerMessage();
  },

  update: function () {
    console.log('%c index - update', 'color: #1d34ff');

    // Why PlayMyCrypto
    window.Index.updateReferralFeesForAllGamesTotal();
    window.Index.updateRafflePrizesWonForAllGamesTotal();
    window.Index.updatePartnerFeesForAllGamesTotal();

    // Raffle
    window.Index.updateCurrentRaffleJackpot();

    window.Index.updateCryptoAmountPlayedOnSiteTotal();
    window.Index.updateRunningGameAmounts();
  },

  updateReferralFeesForAllGamesTotal: async function () {
    let referralTotalCF = await window.BlockchainManager.referralFeesUsedTotal(Types.Game.cf);
    let referralTotalRPS = await window.BlockchainManager.referralFeesUsedTotal(Types.Game.rps);
    let sumStr = Utils.weiToEtherFixed(referralTotalCF.plus(referralTotalRPS)).toString();
    // console.log("totalUsedReferralFees: ", sumStr);
    if ($("#totalUsedReferralFees")[0].textContent.localeCompare(sumStr) != 0) {
      $("#totalUsedReferralFees")[0].textContent = sumStr;
      $("#totalUsedFeeBeneficiary")[0].textContent = sumStr;
    }
  },

  updateRafflePrizesWonForAllGamesTotal: async function () {
    let raffleTotalCF = await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.cf);
    let raffleTotalRPS = await window.BlockchainManager.rafflePrizesWonTotal(Types.Game.rps);
    let sumStr = Utils.weiToEtherFixed(raffleTotalCF.plus(raffleTotalRPS)).toString();
    if ($("#totalUsedRaffleFees")[0].textContent.localeCompare(sumStr) != 0) {
      $("#totalUsedRaffleFees")[0].textContent = sumStr;
    }
    // document.getElementById("totalUsedRaffleFees").innerText = Utils.weiToEtherFixed(raffleTotalCF.plus(raffleTotalRPS)).toString();
  },

  updatePartnerFeesForAllGamesTotal: async function () {
    let partnerFeeUsedTotal_cf = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.cf));
    // console.log("partnerFeeUsedTotal_cf: ", partnerFeeUsedTotal_cf.toString());

    let partnerFeeUsedTotal_rps = new BigNumber(await window.BlockchainManager.partnerFeeUsedTotal(Types.Game.rps));
    // console.log("partnerFeeUsedTotal_rps: ", partnerFeeUsedTotal_rps.toString());

    let sumStr = Utils.weiToEtherFixed((partnerFeeUsedTotal_cf.plus(partnerFeeUsedTotal_rps)).toString());
    if ($("#totalUsedPartnerFees")[0].textContent.localeCompare(sumStr) != 0) {
      $("#totalUsedPartnerFees")[0].textContent = sumStr;
    }

    // document.getElementById("totalUsedPartnerFees").textContent = Utils.weiToEtherFixed((partnerFeeUsedTotal_cf.plus(partnerFeeUsedTotal_rps)).toString());
  },

  updateCurrentRaffleJackpot: async function () {
    let currentRaffleJackpotCF = await window.BlockchainManager.currentRaffleJackpot(Types.Game.cf);
    // console.log("currentRaffleJackpot: ", currentRaffleJackpot.toString());
    let currentRaffleJackpotCF_str = Utils.weiToEtherFixed(currentRaffleJackpotCF.toString());
    if ($("#currentRaffleJackpotCoinFlip")[0].textContent.localeCompare(currentRaffleJackpotCF_str) != 0) {
      $("#currentRaffleJackpotCoinFlip")[0].textContent = currentRaffleJackpotCF_str;
    }
    // document.getElementById("currentRaffleJackpotCoinFlip").textContent = Utils.weiToEtherFixed(currentRaffleJackpotCF.toString());
    
    let currentRaffleJackpotRPS = new BigNumber(await window.BlockchainManager.currentRaffleJackpot(Types.Game.rps));
    // console.log("currentRaffleJackpotRPS: ", currentRaffleJackpotRPS.toString());
    let currentRaffleJackpotRPS_str = Utils.weiToEtherFixed(currentRaffleJackpotRPS.toString());
    if ($("#currentRaffleJackpotRPS")[0].textContent.localeCompare(currentRaffleJackpotRPS_str) != 0) {
      $("#currentRaffleJackpotRPS")[0].textContent = currentRaffleJackpotRPS_str;
    }
    // document.getElementById("currentRaffleJackpotRPS").innerText = Utils.weiToEtherFixed(currentRaffleJackpotRPS.toString());

    let currentRaffleJackpotTotal_str = Utils.weiToEtherFixed(currentRaffleJackpotCF.plus(currentRaffleJackpotRPS)).toString();
    if ($("#currentRaffleJackpotTotal")[0].textContent.localeCompare(currentRaffleJackpotTotal_str) != 0) {
      $("#currentRaffleJackpotTotal")[0].textContent = currentRaffleJackpotTotal_str;
    }
    // document.getElementById("currentRaffleJackpotTotal").innerText = Utils.weiToEtherFixed(currentRaffleJackpotCF.plus(currentRaffleJackpotRPS)).toString();
  },

  updateCryptoAmountPlayedOnSiteTotal: async function () {
    let total_cf = new BigNumber(await window.BlockchainManager.totalUsedInGame(Types.Game.cf));
    // console.log("total_cf: ", total_cf.toString());

    let total_rps = new BigNumber(await window.BlockchainManager.totalUsedInGame(Types.Game.rps));
    // console.log("total_rps: ", total_rps.toString());

    let sumStr = Utils.weiToEtherFixed(total_cf.plus(total_rps)).toString();
    if ($("#cryptoAmountPlayedOnSiteTotal")[0].rows[1].cells[1].innerHTML.localeCompare(sumStr) != 0) {
      $("#cryptoAmountPlayedOnSiteTotal")[0].rows[1].cells[1].innerHTML = sumStr;
    }
    // document.getElementById("cryptoAmountPlayedOnSiteTotal").rows[1].cells[1].innerHTML = Utils.weiToEtherFixed(total_cf.plus(total_rps)).toString();
  },

  updateRunningGameAmounts: async function () {
    //  created
    let created_cf = new BigNumber(await window.BlockchainManager.gamesCreatedAmount(Types.Game.cf));
    // console.log("created_cf: ", created_cf.toString());
    let created_rps = new BigNumber(await window.BlockchainManager.gamesCreatedAmount(Types.Game.rps));
    // console.log("created_rps: ", created_rps.toString());

    //  completed
    let completed_cf = new BigNumber(await window.BlockchainManager.gamesCompletedAmount(Types.Game.cf));
    // console.log("completed_cf: ", completed_cf.toString());
    let completed_rps = new BigNumber(await window.BlockchainManager.gamesCompletedAmount(Types.Game.rps));
    // console.log("completed_rps: ", completed_rps.toString());

    //  running
    let running_cf = parseInt(created_cf) - parseInt(completed_cf);
    if ($("#now_playing_coinflip")[0].textContent.localeCompare(running_cf) != 0) {
      $("#now_playing_coinflip")[0].textContent = running_cf;
    }
    // document.getElementById("now_playing_coinflip").innerText = running_cf;

    let running_rps = parseInt(created_rps) - parseInt(completed_rps);
    if ($("#now_playing_rps")[0].textContent.localeCompare(running_rps) != 0) {
      $("#now_playing_rps")[0].textContent = running_rps;
    }
    // document.getElementById("now_playing_rps").innerText = running_rps;
  },

  infoClicked: function (_idSuffix) {
    var popup = document.getElementById("myPopup_" + _idSuffix);
    popup.classList.toggle("show");
  }
};

window.Index = Index;