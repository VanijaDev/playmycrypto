pragma solidity ^0.5.10;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract GameRaffle is Ownable {
  using SafeMath for uint256;
  
  mapping(address => uint256) public rafflePrizeTotalForAddress;
  uint256 public ongoinRafflePrize;
  uint256 public rafflePrizesWonTotal;

  uint8 public raffleActivationParticipantsAmount = 200;  //  1 game has 2 participants
  address[] public raffleParticipants;  //  the more you play, the more times added

  event RafflePlayed(address indexed winner, uint256 indexed prize);
  event RafflePrizeWithdrawn(address indexed winner, uint256 indexed prize);


  /**
   * @dev Gets raffle participants
   * 
   */
  function getRaffleParticipants() public view returns (address[] memory) {
    return raffleParticipants;
  }
  
  /**
   * @dev Updates raffle minimum participants amount to activate.
   * @param _amount Amount to be set.
   * 
   */
  function updateRaffleActivationParticipantsAmount(uint8 _amount) public onlyOwner {
    require(_amount > 0, "Should be > 0");
    raffleActivationParticipantsAmount = _amount;
  }

  /**
   * @dev Checks if raffle is activated.
   * @return Wether raffle is activated.
   * 
   */
  function raffleActivated() public view returns(bool) {
    return raffleParticipants.length >= raffleActivationParticipantsAmount;
  }

  /**
   * @dev Runs the raffle.
   * 
   */
  function runRaffle() public {
    require(raffleActivated(), "Raffle != activated");

    uint256 winnerIdx = rand();
    rafflePrizeTotalForAddress[raffleParticipants[winnerIdx]] = rafflePrizeTotalForAddress[raffleParticipants[winnerIdx]].add(ongoinRafflePrize);
    rafflePrizesWonTotal = rafflePrizesWonTotal.add(ongoinRafflePrize);

    emit RafflePlayed(raffleParticipants[winnerIdx], ongoinRafflePrize);

    delete ongoinRafflePrize;
    delete raffleParticipants;
  }

  /**
   * @dev Generates random number
   * 
   */
  function rand() public view returns(uint256) {
    return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, ongoinRafflePrize, raffleParticipants.length))) % raffleParticipants.length;
  }

  /**
   * @dev Withdraw raffle prize.
   * 
   */
  function withdrawRafflePrize() public {
    require(rafflePrizeTotalForAddress[msg.sender] > 0, "No prize");

    uint256 prize = rafflePrizeTotalForAddress[msg.sender];
    delete rafflePrizeTotalForAddress[msg.sender];

    msg.sender.transfer(prize);

    emit RafflePrizeWithdrawn(msg.sender, prize);
  }
}
