// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

abstract contract IExpiryMoveDuration {
  uint16 public gameMoveDuration = 5 minutes;

  /**
   * @dev Updates game move duration.
   * @param _duration Game duration.
   */
  function updateGameMoveDuration(uint16 _duration) external virtual;

  /**
   * @dev Checks if game is expired.
   * @param _id Game id.
   * @return Is game expired.
   */
  function gameMoveExpired(uint256 _id) public view virtual returns(bool);

  /**
   * @dev Finishes expired game.
   * @param _id Game id.
   */
  function finishExpiredGame(uint256 _id) external virtual;
}