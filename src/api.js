const fetch = require('node-fetch')
const axios = require('axios')
const players = require('./players')
const cheerio = require('cheerio')

const fetchPlayerProfile = async playerName => {
  const html = await fetch(players[playerName])
    .then(d => d.text())
    .then(t => t)

  return html
}

const fetchPlayByPlayForGames = async link => {
  const html = await fetch(link)
    .then(d => d.text())
    .then(e => e)

  return html
}

const fetchVideosForPlays = async actions => {
  const videos = await Promise.all(
    actions.map(({ gameId, eventId }) => fetchVideoForPlay(gameId, eventId))
  )

  return actions.map(a => ({
    ...a,
    videoUrl: videos.find(
      ({ gameId, eventId }) => gameId === a.gameId && eventId === a.eventId
    )
  }))
}

const fetchVideoForPlay = async (gameId, eventId) => {
  const json = await axios({
    method: 'get',
    url: `https://stats.nba.com/stats/videoeventsasset?GameID=${gameId}&GameEventID=${eventId}`,
    headers: {
      Host: 'stats.nba.com',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'x-nba-stats-origin': 'stats',
      'x-nba-stats-token': 'true',
      Connection: 'keep-alive',
      Referer: 'https://stats.nba.com/',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache'
    }
  })
    .then(
      ({
        data: {
          resultSets: {
            Meta: { videoUrls }
          }
        }
      }) => {
        return {
          gameId,
          eventId,
          videoUrl: videoUrls.length > 0 ? videoUrls[0]['murl'] : ''
        }
      }
    )
    .catch(error => console.error(error))

  return json
}

const parsePlayerBio = html => {
  const $ = cheerio.load(html)

  return {
    image: $('.PlayerImage_image__1smob.mx-auto').attr('src'),
    team_image: $('.absolute.w-16.min-w-0.mt-5 img').attr('src'),
    team: $('.flex.flex-col.mb-2.text-white > p:first-child')
      .text()
      .split('|')[0]
      .trim(),
    player_number: $('.flex.flex-col.mb-2.text-white > p:first-child')
      .text()
      .split('|')[1]
      .trim()[1],
    position: $('.flex.flex-col.mb-2.text-white > p:first-child')
      .text()
      .split('|')[2]
      .trim()
  }
}

const parsePlayerLastGame = (html, gameNumber) => {
  const $ = cheerio.load(html)

  let links = $(
    '.MockStatsTable_statsTable__2edDg table tbody > tr .PlayerGameLogs_primaryCol__2btH4 a'
  )
    .map((_, e) => $(e).attr('href'))
    .toArray()

  links = links.map(l =>
    `https://www.nba.com${l}`.replace('box-score', 'play-by-play')
  )

  return links[gameNumber]
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

const fetchTwitterProfile = playerName =>
  `https://twitter.com/search?q=${encodeURIComponent(
    playerName
  )}&src=typed_query`

module.exports = {
  fetchPlayerProfile,
  fetchPlayByPlayForGames,
  fetchVideoForPlay,
  parsePlayerBio,
  parsePlayerLastGame,
  parsePlayerPlaysForGame,
  fetchVideosForPlays,
  fetchTwitterProfile
}
