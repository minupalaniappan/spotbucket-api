const fetch = require('node-fetch')
const players = require('./players')
const last = require('lodash/last')
const zipObject = require('lodash/zipObject')

const fetchPlayerStats = async playerName => {
  const id = players[playerName].split('/')[4]

  const data = await fetch(
    `https://stats.nba.com/stats/playerprofilev2?PlayerID=${id}&PerMode=PerGame`,
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
    .then(({ resultSets }) => {
      const { headers, rowSet } = resultSets[0]
      const vals = last(rowSet)

      return zipObject(headers, vals)
    })

  return data
}

module.exports = {
  fetchPlayerStats
}
