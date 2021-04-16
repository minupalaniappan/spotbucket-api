const {
  fetchPlayByPlayForGames,
  fetchPlayerProfile,
  parsePlayerLastGame,
  parsePlayerPlaysForGame,
  parsePlayerBio,
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
  const playerBio = parsePlayerBio(playerProfile)

  const lastGame = parsePlayerLastGame(playerProfile, game)

  const playByPlaysForGame = await fetchPlayByPlayForGames(lastGame)

  let totalPlays = parsePlayerPlaysForGame(playByPlaysForGame, playerName)

  const pagedPlays = arrayPaginate(totalPlays, page, perPage)

  const plays = await fetchVideosForPlays(pagedPlays.docs)

  const {
    image: profile_image,
    team,
    position,
    player_number,
    team_image
  } = playerBio

  return {
    profile_image,
    nba_profile: players[playerName],
    player_name: playerName,
    player_number,
    position,
    team,
    team_image,
    plays,
    totalPlays: totalPlays.length,
    totalPages: pagedPlays.totalPages,
    hasNextPage: pagedPlays.hasNextPage
  }
}

module.exports = run
