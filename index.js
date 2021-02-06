const express = require('express')
const run = require('./src/run')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const {
    query: { name }
  } = req

  const payload = await run(name)

  try {
    if (!payload) {
      res.status(400).json(payload)
    } else {
      res.status(200).json(payload)
    }
  } catch (e) {
    res.status(500).json({
      error: JSON.stringify(e)
    })
  }
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
