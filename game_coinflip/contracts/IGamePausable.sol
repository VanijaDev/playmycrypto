// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

abstract contract IGamePausable {

  event CF_GamePaused(uint256 indexed id);
  event CF_GameUnpaused(uint256 indexed id, address indexed creator);

  /**
   * @dev Check if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   */
  function gameOnPause(uint256 _id) public view virtual returns(bool);

  /**
   * @dev Pause game.
   * @param _id Game index.
   */
  function pauseGame(uint256 _id) external virtual;

  /**
   * @dev Unpause game.
   * @param _id Game index.
   */
  function unpauseGame(uint256 _id) external payable virtual;
}
