const express = require('express')
const run = require('./src/run')
const { fetchPlayerStats } = require('./src/stats')
const app = express()
const cors = require('cors')

app.use(cors())

app.get('/stats', async (req, res) => {
  const {
    query: { name }
  } = req

  if (!name) {
    res.status(400).json({})
  }

  try {
    const stats = await fetchPlayerStats(name)

    res.status(200).json({
      stats,
      playerName: name
    })
  } catch (e) {
    res.status(500).json({
      error: e.toString()
    })
  }
})

app.get('/', async (req, res) => {
  const {
    query: { name, game = 0, perPage = 5, page = 0 }
  } = req

  const params = {
    game: parseInt(game),
    perPage,
    page: parseInt(page)
  }

  try {
    if (!name) {
      throw 'Name not provided!'
    }

    const payload = await run(name, params)

    if (!payload) {
      res.status(400).json(payload)
    } else {
      res.status(200).json({
        ...payload,
        params
      })
    }
  } catch (e) {
    res.status(500).json({
      error: e.toString()
    })
  }
})

app.listen(process.env.PORT || 5000)
