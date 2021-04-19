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
  console.log(playerProfile)
  const playerBio = parsePlayerBio(playerProfile)
  console.log(playerBio)

  const lastGame = parsePlayerLastGame(playerProfile, game)
  console.log(lastGame)
  const playByPlaysForGame = await fetchPlayByPlayForGames(lastGame)
  console.log(playByPlaysForGame)

  let totalPlays = parsePlayerPlaysForGame(playByPlaysForGame, playerName)

  console.log(totalPlays)

  const pagedPlays = arrayPaginate(totalPlays, page, perPage)

  console.log(pagedPlays)

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
