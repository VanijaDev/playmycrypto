// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/access/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

abstract contract GameRaffle is Ownable {
  using SafeMath for uint256;

  struct RaffleResult {
    address winner;
    uint256 prize;
    uint256 time;
  }
  
  mapping(address => uint256) public rafflePrizePending;
  uint256 public ongoinRafflePrize;
  uint256 public rafflePrizesWonTotal;

  uint256 public raffleActivationParticipantsAmount = 200;  //  1 game has 2 participants
  address[] public raffleParticipants;  //  the more you play, the more times added
  RaffleResult[] public raffleResults;


  event RPS_RafflePlayed(address indexed winner, uint256 indexed prize);
  event RPS_RafflePrizeWithdrawn(address indexed winner, uint256 indexed prize);


  /**
   * @dev Gets raffle participants.
   * @return Participants count.
   * 
   */
  function getRaffleParticipants() external view returns (address[] memory) {
    return raffleParticipants;
  }
  
  /**
   * @dev Updates raffle minimum participants Count to activate.
   * @param _amount Amount to be set.
   * 
   */
  function updateRaffleActivationParticipantsCount(uint256 _amount) external onlyOwner {
    require(_amount > 0, "Should be > 0");
    raffleActivationParticipantsAmount = _amount;
  }

  /**
   * @dev Gets past raffle results count.
   * @return Results count.
   * 
   */
  function getRaffleResultCount() external view returns (uint256) {
    return raffleResults.length;
  }

  /**
   * @dev Checks if raffle is activated.
   * @return Wether raffle is activated.
   * 
   */
  function raffleActivated() public view returns(bool) {
    return (raffleParticipants.length >= raffleActivationParticipantsAmount && ongoinRafflePrize > 0);
  }

  /**
   * @dev Runs the raffle.
   * 
   */
  function runRaffle() external {
    require(raffleActivated(), "Raffle != activated");

    uint256 winnerIdx = rand();
    rafflePrizePending[raffleParticipants[winnerIdx]] = rafflePrizePending[raffleParticipants[winnerIdx]].add(ongoinRafflePrize);
    rafflePrizesWonTotal = rafflePrizesWonTotal.add(ongoinRafflePrize);
    raffleResults.push(RaffleResult(raffleParticipants[winnerIdx], ongoinRafflePrize, now));

    emit RPS_RafflePlayed(raffleParticipants[winnerIdx], ongoinRafflePrize);

    delete ongoinRafflePrize;
    delete raffleParticipants;
  }

  /**
   * @dev Generates random number
   * 
   */
  function rand() public view returns(uint256) {
    require(raffleParticipants.length > 0, "No participants");
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, ongoinRafflePrize, raffleParticipants.length))) % raffleParticipants.length;
  }

  /**
   * @dev Withdraw prizes for all won raffles.
   */
  function withdrawRafflePrizes() external virtual;
}
