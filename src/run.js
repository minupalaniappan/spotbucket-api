const {
  fetchPlayByPlayForGame,
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

  console.log(lastFiveGames)

  const playByPlaysForGames = await Promise.all(
    lastFiveGames.map(({ gameId }) => fetchPlayByPlayForGame(gameId))
  )

  const getPlaysWithPlayer = playByPlaysForGames.map(e =>
    parsePlayerPlaysForGame(e)
  )
}

module.exports = run
