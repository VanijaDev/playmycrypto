// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/access/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @dev Contract module which provides a basic fu=nctionality for donates to partner address.
 */
contract Partnership is Ownable {
  using SafeMath for uint256;
  
  address payable public partner;
  
  uint256 public partnerFeeTransferThreshold;
  uint256 public partnerFeePending;
  uint256 public partnerFeeTotalUsed;

  event CF_PartnerFeeTransferred(address from, address indexed to, uint256 indexed amount);

  /**
   * @dev Initializes the contract.
   * @param _partnerAddress Partner address.
   * @param _transferThreshold Fee amount, that should trigger transfer.
   * TESTED
   */
  constructor(address payable _partnerAddress, uint256 _transferThreshold) public {
    updatePartner(_partnerAddress);
    updatePartnerTransferThreshold(_transferThreshold);
  }

  /**
   * @dev Updates partner address.
   * @param _partnerAddress Address for partner.
   * TESTED
   */
  function updatePartner(address payable _partnerAddress) public onlyOwner {
    require(_partnerAddress != address(0), "Wrong partner");
    partner = _partnerAddress;
  }

  /**
   * @dev Updates partner fee transfer threshold limit, when fee should be transferred to address.
   * @notice In wei.
   * @param _transferThreshold Fee amount, that should trigger transfer.
   * TESTED
   */
  function updatePartnerTransferThreshold(uint256 _transferThreshold) public onlyOwner {
    require(_transferThreshold > 0, "threshold must be > 0");
    partnerFeeTransferThreshold = _transferThreshold;
  }

  /**
   * @dev Transfers partner fee to partner address if threshold was reached.
   * TESTED
   */
  function transferPartnerFee() internal {
    if (partnerFeePending >= partnerFeeTransferThreshold) {
      uint256 partnerFeePendingTmp = partnerFeePending;
      delete partnerFeePending;

      partnerFeeTotalUsed = partnerFeeTotalUsed.add(partnerFeePendingTmp);
      partner.transfer(partnerFeePendingTmp);
      emit CF_PartnerFeeTransferred(address(this), partner, partnerFeePendingTmp);
    }
  }
}
