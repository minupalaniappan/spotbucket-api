const express = require('express')
const run = require('./src/run')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const {
    query: { name }
  } = req

  const payload = await run(name)

  if (!payload) {
    res.json(
      {
        payload
      },
      400
    )
  }
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
