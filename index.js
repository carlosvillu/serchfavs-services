const express = require('express')
const cors = require('cors')
const SSE = require('sse-nodejs')
const Twit = require('twit')
const app = express()
const PORT = process.env.PORT || 3000

const BASE_CREDENTIALS = require('./credentials.json')
const clientFactory =
  ({access_token, access_token_secret} = {}) =>
      new Twit(Object.assign({}, BASE_CREDENTIALS, {access_token, access_token_secret}))

app.use(cors())

app.use((req, res, next) => {
  console.log(req.method)
  next()
})

app.get('/', (req, res) => res.send('Pong!'))

app.get('/status', (req, res) => {
  const sse = SSE(res)
  const {token: access_token, secret: access_token_secret, track = '#', language = 'en'} = req.query

  console.log({access_token, access_token_secret, track, language})
  clientFactory({access_token, access_token_secret})
    .stream('statuses/filter', { track, language})
    .on('tweet', sse.sendEvent.bind(sse, 'tweet'))
    .on('error', (err) => res.json(err))
})

app.get('/favs', (req, res) => {
  const {token: access_token, secret: access_token_secret} = req.query
  clientFactory({access_token, access_token_secret})
    .get('favorites/list', {count: 200})
    .then(result => res.json(result.data))
    .catch(err => res.json(500, err))
})

app.use((req, res, next) => {
  res.json({msg: 'NOT_FOUND', path: req.path, favs: 'GET /favs'})
})

app.use((err, req, res, next) => {
  res.json(err)
})

if (process.env.NOW = 'production') {
  app.listen()
} else {
  app.listen(PORT, () => console.log(`Listen in the PORT ${PORT}`))
}
