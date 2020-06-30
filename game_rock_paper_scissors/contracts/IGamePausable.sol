pragma solidity 0.5.8;

contract IGamePausable {

  event RPS_GamePaused(uint256 indexed id);
  event RPS_GameUnpaused(uint256 indexed id, address indexed creator);

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
  function pauseGame(uint256 _id) external;

  /**
   * @dev Unpauses game.
   * @param _id Game index.
   */
  function unpauseGame(uint256 _id) external payable;
}
