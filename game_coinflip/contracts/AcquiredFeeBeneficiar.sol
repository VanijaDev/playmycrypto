// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/access/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @dev Contract that allowes user to purchase right to receive % of game prizes.
 * @notice Beneficiary address will be reset after single address is being set 15 days.
 */
contract AcquiredFeeBeneficiar is Ownable {
  using SafeMath for uint256;

  uint256 public ACQUIRED_FEE_BENEFICIARY_MAX_DURATION = 15 days;  //  max duration for single beneficiar

  uint256 public latestBeneficiarPrice;

  address payable public feeBeneficiar; //  ongoing address to get fees during withdrawals
  uint256 public feeBeneficiarPurchasedAt;  //  timestamp, when purchased

  mapping(address => uint256) public feeBeneficiarBalances;

  /**
   * @dev Purchase right to become fee beneficiar.
   * TESTED
   */
  function makeFeeBeneficiar() external payable {
    require(msg.value > latestBeneficiarPrice, "Wrong amount");

    latestBeneficiarPrice = msg.value;
    feeBeneficiar = msg.sender;
    feeBeneficiarPurchasedAt = now;
  }

  /**
   * @dev Add fee amount to ongoing beneficiar balance.
   * @param _amount Amount of fee to be added.
   * TESTED
   */
  function addBeneficiarFee(uint256 _amount) internal {
    resetFeeBeneficiarIfExceeded();

    feeBeneficiarBalances[feeBeneficiar] = feeBeneficiarBalances[feeBeneficiar].add(_amount);
  }

  /**
   * @dev Withdraws beneficiary fee.
   * TESTED
   */
  function withdrawBeneficiaryFee() external {
    uint256 fee = feeBeneficiarBalances[msg.sender];
    require(fee > 0, "No fee");

    delete feeBeneficiarBalances[msg.sender];
    msg.sender.transfer(fee);

    resetFeeBeneficiarIfExceeded();
  }

  /**
   * @dev Resets fee beneficiar to owner if max duration exceeded.
   * TESTED
   */
  function resetFeeBeneficiarIfExceeded() private {
    if (feeBeneficiar == owner()) {
      return;
    }

    if (now.sub(feeBeneficiarPurchasedAt) > ACQUIRED_FEE_BENEFICIARY_MAX_DURATION) {
      address payable ownerAddr = address(uint160(owner()));
      feeBeneficiar = ownerAddr;
      delete feeBeneficiarPurchasedAt;
      delete latestBeneficiarPrice;
    }
  }
}