const fetch = require('node-fetch')
const players = require('./players')
const cheerio = require('cheerio')

const fetchPlayerProfile = async playerName => {
  const html = await fetch(players[playerName])
    .then(d => d.text())
    .then(t => t)

  return html
}

const fetchPlayByPlayForGame = async gameId => {}

const fetchVideoForPlay = async (gameId, eventId) => {}

const parsePlayerStats = html => {
  const $ = cheerio.load(html)

  return {
    image: $('.PlayerImage_image__1smob.mx-auto').attr('src'),
    ppg: $($('.PlayerSummary_playerStatValue__3hvQY').get(0)).text().trim(),
    rpg: $($('.PlayerSummary_playerStatValue__3hvQY').get(1)).text().trim(),
    apg: $($('.PlayerSummary_playerStatValue__3hvQY').get(2)).text().trim()
  }
}

const parsePlayerLastFiveGames = html => {
  const $ = cheerio.load(html)

  let links = $(
    '.MockStatsTable_statsTable__2edDg table tbody > tr .PlayerGameLogs_primaryCol__2btH4 a'
  )
    .map((_, e) => $(e).attr('href'))
    .toArray()

  links = links.map(l =>
    `https://www.nba.com${l}`.replace('box-score', 'play-by-play')
  )

  return links
}

const parsePlayerPlaysForGame = html => {}

module.exports = {
  fetchPlayerProfile,
  fetchPlayByPlayForGame,
  fetchVideoForPlay,
  parsePlayerStats,
  parsePlayerLastFiveGames,
  parsePlayerPlaysForGame
}
