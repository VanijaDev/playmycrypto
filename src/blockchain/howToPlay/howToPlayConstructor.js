const HowToPlayConstructor = {
  template_cf: function () {
    var cf = 
      '<li>' +
          '<div><span>Player can </span> <span class="bold-in-span">START NEW GAME</span> <span> or </span> <span class="bold-in-span">JOIN</span> <span> already running AVAILABLE GAMES / TOP GAMES.</span></div>' +
      '</li>' +
      ' <li>' +
          '<p class="how_to_section_title">START NEW GAME</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player must enter bet value and choose the coin side;</div>' +
            '<div>- referral address is optional and alloves to receive 2% of prize if player wins;</div>' +
            '<div>- game information on the left side is empty for now;</div>' +
            '<div>- only one game can be created by an account;</div>' +
            '<div>- player can increase bet only while waiting for the opponent;</div>' +
            '<div>- player can add game to TOP GAMES while waiting for the opponent;</div>' +
          ' </div>' +
      '</li>' +
      '<li>' +
          '<p class="how_to_section_title">JOIN GAME</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player must have respectful amount of crypto to accept the game;</div>' +
            '<div>- referral address is optional and alloves to receive 2% of prize if player wins;</div>' +
            '<div>- coin side and game bet are predefined by creator;</div>' +
            '<div>- player can see game information on the left side;</div>' +
            '<div>- game will be automatically played after joining and result will be displayed.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">AVAILABLE GAMES</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- general game list;</div>' +
            '<div>- newly created games will be added on top of the list;</div>' +
            '<div>- short information is displayed for each game;</div>' +
            '<div>- use LOAD MORE button to download next game portion;</div>' +
            '<div>- player can not see his own game.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">TOP GAMES</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- up to 5 games are always visible to all players in a separate section;</div>' +
            '<div>- player can not see his own game.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
        '<p class="how_to_section_title">PROFILE</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player can see current account’s information;</div>' +
            '<div>- use WITHDRAW PENDING section to withdraw pending prizes and bonuses.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">RAFFLE</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- players who played games after previous raffle launch take part in the next raffle;</div>' +
            '<div>- 1% of game prize will be added to the ongoing raffle prize when player withdraws the game prize;</div>' +
            '<div>- raffle can be started as soon as minimum participants number is reached and ongoing raffle prize exceeds 0;</div>' +
            '<div>- players are automatically added to raffle participants in case the game is completed;</div>' +
            '<div>- only game winner will be added to raffle participants in case the game was quitted or move expired.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">FEE DISTRIBUTION</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- fees are subtracted from game prize when player withdraws the game prize;</div>' +
            '<div>- 90% goes to winner;</div>' +
            '<div>- 2% goes to referral address;</div>' +
            '<div>- 2% goes to the ongoing raffle prize;</div>' +
            '<div>- 2% goes to partner\'s project game;</div>' +
            '<div>- 4% goes to game developers.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">SMART CONTRACT</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- <a href="https://etherscan.io/address/0xb77FeddB7e627a78140a2a32CAC65A49eD1DBa8E" target="blank">Coinflip on Etherscan</a></div>' +
          '</div>' +
        ' </li>';

    return cf;
  },

  template_rps: function () {
    var rps = 
      '<li>' +
        '<div><span>Player can </span> <span class="bold-in-span">START NEW GAME</span> <span> or </span> <span class="bold-in-span">JOIN</span> <span> already running AVAILABLE GAMES / TOP GAMES.</span></div>' +
      '</li>' +
      ' <li>' +
          '<p class="how_to_section_title">START NEW GAME</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player must enter bet value, select move and enter seed phrase to hash the move. Seed phrase is to be memorized and used in next creator\'s move to retrieve selected move from the CREATOR\'S MOVE HASH;</div>' +
            '<div>- referral address is optional and allows to receive 2% of prize if player wins;</div>' +
            '<div>- game information on the left side is empty for now;</div>' +
            '<div>- only one game can be created by an account;</div>' +
            '<div>- player can increase bet only while waiting for the opponent;</div>' +
            '<div>- player can add game to TOP GAMES while waiting for the opponent;</div>' +
          ' </div>' +
      '</li>' +
      '<li>' +
          '<p class="how_to_section_title">JOIN GAME</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player must have respectful amount of crypto to accept the game;</div>' +
            '<div>- player must select move;</div>' +
            '<div>- referral address is optional and allows to receive 2% of prize if player wins;</div>' +
            '<div>- player can see game information on the left side;</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">AVAILABLE GAMES</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- general game list;</div>' +
            '<div>- newly created games will be added on top of the list;</div>' +
            '<div>- short information is displayed for each game;</div>' +
            '<div>- use LOAD MORE button to download next game portion;</div>' +
            '<div>- player can not see his own game.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">TOP GAMES</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- up to 5 games are always visible to all players in a separate section;</div>' +
            '<div>- player can not see his own game.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
        '<p class="how_to_section_title">PROFILE</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- player can see current account’s information;</div>' +
            '<div>- use WITHDRAW PENDING section to withdraw pending prizes and bonuses.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">RAFFLE</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- players who played games after previous raffle launch take part in the next raffle;</div>' +
            '<div>- 1% of game prize will be added to the ongoing raffle prize when player withdraws the game prize;</div>' +
            '<div>- raffle can be started as soon as minimum participants number is reached and ongoing raffle prize exceeds 0;</div>' +
            '<div>- players are automatically added to raffle participants in case the game is completed;</div>' +
            '<div>- only game winner will be added to raffle participants in case the game was quitted or move expired.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">FEE DISTRIBUTION</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- fees are subtracted from game prize when player withdraws the game prize;</div>' +
            '<div>- 90% goes to winner;</div>' +
            '<div>- 2% goes to referral address;</div>' +
            '<div>- 2% goes to the ongoing raffle prize;</div>' +
            '<div>- 2% goes to partner\'s project game;</div>' +
            '<div>- 4% goes to game developers.</div>' +
          '</div>' +
        '</li>' +
        ' <li>' +
          '<p class="how_to_section_title">CREATOR\'S MOVE HASH</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- all data in Blockchain is public, but creator\'s move remains hidden until the opponent performs his move;</div>' +
            '<div>- hash string is created from creator\'s selected move and seed phrase. CREATOR\'S MOVE HASH will be sent as move representation;</div>' +
            '<div>- game creator must reveal his previous move before performing the next move. Previous move and seed phrase are used for this;</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">SUSPENDED VIEW</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- spam, DDOS-like and malicious actions are to be prevented;</div>' +
            '<div>- player\'s account will be restricted from joining next game for certain period of time after previousl game is completed;</div>' +
            '<div>- player can use his other accounts to play.</div>' +
          '</div>' +
        '</li>' +
        '<li>' +
          '<p class="how_to_section_title">SMART CONTRACT</p>' +
          '<div class="how_to_section_instructions">' +
            '<div>- <a href="https://etherscan.io/address/0xb77FeddB7e627a78140a2a32CAC65A49eD1DBa8E" target="blank">Rock Paper Scissors on Etherscan</a></div>' +
          '</div>' +
        '</li>';

    return rps;
  }
}

export {
  HowToPlayConstructor
}