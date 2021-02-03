const cheerio = require('cheerio')
const fetch = require('node-fetch')

const run = async () => {
  const text = await fetch('https://basketball.realgm.com/nba/players')
    .then(e => e.text())
    .then(d => d)

  const $ = cheerio.load(text)
  const players = $('td[data-th="Player"] > a')
    .map((_, e) => $(e).text().trim())
    .toArray()
}

run()
