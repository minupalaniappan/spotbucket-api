const axios = require('axios')
const players = require('./players')
const last = require('lodash/last')
const zipObject = require('lodash/zipObject')

const fetchPlayerStats = async playerName => {
  const id = players[playerName].split('/')[4]

  const data = await axios({
    method: 'get',
    url: `https://stats.nba.com/stats/playerprofilev2?PlayerID=${id}&PerMode=PerGame`,
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
  }).then(({ data: { resultSets } }) => {
    const { headers, rowSet } = resultSets[0]
    const vals = last(rowSet)

    return zipObject(headers, vals)
  })

  return data
}

module.exports = {
  fetchPlayerStats
}
