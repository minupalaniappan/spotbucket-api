const fetch = require('node-fetch')
const players = require('./players')
const cheerio = require('cheerio')
const qs = require('qs')

const fetchPlayerProfile = async playerName => {
  const html = await fetch(players[playerName])
    .then(d => d.text())
    .then(t => t)

  return html
}

const fetchPlayByPlayForGames = async links => {
  const htmls = await Promise.all(
    links.map(l =>
      fetch(l)
        .then(d => d.text())
        .then(e => e)
    )
  )

  return htmls
}

const fetchVideoForPlay = async (gameId, eventId) => {}

const parsePlayerStats = html => {
  const $ = cheerio.load(html)

  return {
    image: $('.PlayerImage_image__1smob.mx-auto').attr('src'),
    ppg: $($('.PlayerSummary_playerStatValue__3hvQY').get(0)).text().trim(),
    rpg: $($('.PlayerSummary_playerStatValue__3hvQY').get(1)).text().trim(),
    apg: $($('.PlayerSummary_playerStatValue__3hvQY').get(2)).text().trim(),
    team: $('.flex.flex-col.mb-2.text-white > p:first-child')
      .text()
      .split('|')[0]
      .trim()
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

const parsePlayerPlaysForGame = (html, playerName) => {
  const $ = cheerio.load(html)

  const playByPlayData = JSON.parse($('#__NEXT_DATA__').contents().text())

  const {
    props: {
      pageProps: { playByPlay: playByPlay }
    }
  } = playByPlayData

  let { gameId, actions } = playByPlay

  actions = actions
    .filter(
      ({ videoAvailable, playerNameI }) =>
        videoAvailable === 1 &&
        playerNameI ===
          `${playerName.split(' ')[0][0]}. ${playerName.split(' ')[1]}`
    )
    .map(
      ({
        actionNumber: eventId,
        shotDistance,
        shotResult,
        actionType,
        description
      }) => ({
        eventId,
        shotDistance,
        shotResult,
        actionType: actionType.trim(),
        description: description.trim(),
        gameId
      })
    )

  return actions
}

module.exports = {
  fetchPlayerProfile,
  fetchPlayByPlayForGames,
  fetchVideoForPlay,
  parsePlayerStats,
  parsePlayerLastFiveGames,
  parsePlayerPlaysForGame
}
