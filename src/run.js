const { flatten } = require('lodash')
const {
  fetchPlayByPlayForGames,
  fetchPlayerProfile,
  parsePlayerLastFiveGames,
  parsePlayerPlaysForGame,
  parsePlayerStats
} = require('./api')

const players = require('./players')

const run = async playerName => {
  if (!players[playerName]) {
    return null
  }

  const playerProfile = await fetchPlayerProfile(playerName)
  const playerStats = parsePlayerStats(playerProfile)

  const lastFiveGames = parsePlayerLastFiveGames(playerProfile)

  const playByPlaysForGames = await fetchPlayByPlayForGames(lastFiveGames)

  const plays = playByPlaysForGames.map(e =>
    parsePlayerPlaysForGame(e, playerName)
  )

  const { image: profile_image, team, ...stats } = playerStats

  return {
    profile_image,
    playerName,
    team,
    stats,
    plays: flatten(plays)
  }
}

module.exports = run
