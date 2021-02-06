const express = require('express')
const run = require('./src/run')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const {
    query: { name, game = 1, perPage = 5, page = 1 }
  } = req

  const params = {
    game,
    perPage,
    page
  }

  const payload = await run(name, params)

  console.log(req)

  try {
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
      error: JSON.stringify(e)
    })
  }
})

app.listen(process.env.PORT || 5000)
