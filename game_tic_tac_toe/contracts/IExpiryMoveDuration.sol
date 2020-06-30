pragma solidity ^0.5.10;


contract IExpiryMoveDuration {
  uint16 public gameMoveDuration = 300;

  /**
   * @dev Checks if game is expired.
   * @param _duration Game duration.
   * @return Is game expired.
   * @notice Add onlyOwner modifier.
   */
  function updateGameMoveDuration(uint16 _duration) public;

  /**
   * @dev Checks if game is expired.
   * @param _id Game id.
   * @return Is game expired.
   */
  function gameMoveExpired(uint256 _id) public view returns(bool);

  /**
   * @dev Claims prize for expired game.
   * @param _id Game id.
   */
  function claimExpiredGamePrize(uint256 _id) public;
}
