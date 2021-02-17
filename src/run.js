const {
  fetchPlayByPlayForGames,
  fetchPlayerProfile,
  parsePlayerLastGame,
  parsePlayerPlaysForGame,
  parsePlayerBio,
  fetchVideosForPlays,
  fetchTwitterProfile
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
    ppg,
    apg,
    rpg,
    team_image
  } = playerBio

  const twitter_profile = fetchTwitterProfile(playerName)

  return {
    profile_image,
    nba_profile: players[playerName],
    twitter_profile,
    player_name: playerName,
    position,
    team,
    team_image,
    stats: { ppg, apg, rpg },
    plays,
    totalPlays: totalPlays.length,
    totalPages: pagedPlays.totalPages,
    hasNextPage: pagedPlays.hasNextPage
  }
}

module.exports = run
