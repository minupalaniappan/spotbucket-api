const {
  fetchPlayByPlayForGames,
  fetchPlayerProfile,
  parsePlayerLastGame,
  parsePlayerPlaysForGame,
  parsePlayerStats,
  fetchVideosForPlays
} = require('./api')

const players = require('./players')
const arrayPaginate = require('array-paginate')

const run = async (playerName, params) => {
  if (!players[playerName]) {
    return null
  }

  const { game, perPage, page } = params

  const playerProfile = await fetchPlayerProfile(playerName)
  const playerStats = parsePlayerStats(playerProfile)

  const lastGame = parsePlayerLastGame(playerProfile, game)

  const playByPlaysForGame = await fetchPlayByPlayForGames(lastGame)

  let totalPlays = parsePlayerPlaysForGame(playByPlaysForGame, playerName)

  const pagedPlays = arrayPaginate(totalPlays, page, perPage)

  const plays = await fetchVideosForPlays(pagedPlays.docs)

  const { image: profile_image, team, ...stats } = playerStats

  return {
    profile_image,
    playerName,
    team,
    stats,
    plays,
    totalPlays: totalPlays.length,
    totalPages: pagedPlays.totalPages,
    hasNextPage: pagedPlays.hasNextPage
  }
}

module.exports = run
