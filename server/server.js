
const express = require('express')
const request = require('request')
const querystring = require('querystring')
const dotenv = require('dotenv')
const fs = require("fs");
const addRequestId = require("express-request-id")();
const bodyParser = require("body-parser");
const multer = require("multer");
const forms = multer();
const cors = require('cors');
const app = express()



app.use(cors())

app.use(addRequestId);

app.use(bodyParser.json());
app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

const redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000/playback'
    res.redirect(uri + '?access_token=' + access_token)
  })
});

app.get('/user/array', function(req, res){
  let lyricsArr = [
    //Length is represtend of seconds
    {lyrics: "hello world", timelength:2},
    {lyrics: "nice talking to world", timelength:6},
    {lyrics: "its been nice world", timelength:3},
    {lyrics: "goodbye world", timelength:1}
]
  res.json(lyricsArr)
})


let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. authencation server.`)
const result = dotenv.config()


console.log(result.parsed)
app.listen(port)