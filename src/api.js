const fetch = require('node-fetch')
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
  const json = await fetch(
    `https://stats.nba.com/stats/videoeventsasset?GameEventID=${eventId}&GameID=${gameId}`,
    {
      headers: {
        Connection: 'keep-alive',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Accept: 'application/json, text/plain, */*',
        'x-nba-stats-token': 'true',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
        'x-nba-stats-origin': 'stats',
        Origin: 'https://www.nba.com',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: 'https://www.nba.com/',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }
  )
    .then(d => d.json())
    .then(({ resultSets: { Meta: { videoUrls } } }) => ({
      gameId,
      eventId,
      videoUrl: videoUrls.length > 0 ? videoUrls[0]['murl'] : ''
    }))

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
