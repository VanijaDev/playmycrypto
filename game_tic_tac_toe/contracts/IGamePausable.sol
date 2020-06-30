pragma solidity ^0.5.10;


contract IGamePausable {

  event GamePaused(uint256 id);
  event GameUnpaused(uint256 id);

  /**
   * @dev Checks if game is paused.
   * @param _id Game index.
   * @return Is game paused.
   */
  function gameOnPause(uint256 _id) public view returns(bool);

  /**
   * @dev Pauses game.
   * @param _id Game index.
   */
  function pauseGame(uint256 _id) public;

  /**
   * @dev Unpauses game.
   * @param _id Game index.
   */
  function unpauseGame(uint256 _id) public;
}
