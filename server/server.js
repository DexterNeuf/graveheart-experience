
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
  const readFile =JSON.parse(fs.readFileSync("./data/m3.json", "utf8"))
  const trackIndex = readFile.findIndex((e) => e.trackName === req.query.trackName)
  res.json((readFile[trackIndex].lyrics))

})

app.get('/user/lrc', function (req,res){
  res.json(lrc)
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. authencation server.`)
const result = dotenv.config()

const lrc = `[00:00.00]{Intro}

[00:18.71]I’m in this bitch and I’m balling out
[00:20.61]Severed ties, I been dying for diamonds
[00:22.27]I got a vision of all of my brothers reclining, dining, all on a island
[00:25.30]My intuition is telling me
[00:27.32]All of the work and all of your time in
[00:28.69]This not nothing, not just rhyming
[00:30.23]This my destiny and I’m grinding
[00:31.93]Gotta pursue it cause I know
[00:33.30]Everything round me gon’ change
[00:34.96]Gotta go XXL, explode before my expiration date
[00:37.71]Ex gon' feel it when I blow
[00:39.82]See my prospects bout to change
[00:41.55]Want the money, not the fame
[00:43.21]I want freedom, not no chains
[00:44.83]I know my dawgs gon' ball out
[00:46.25]I hit a stage and they pay me
[00:47.61]I wanna roll in a rover
[00:49.31]Bitches gon’ feel when it’s Gravey
[00:50.93]I want models, bottles
[00:52.87]‘Pon arrival, throwing like Brady
[00:54.28]Out in Cabo, DELIKADO
[00:55.90]How they gotta play me
[00:57.51]I’m Aristotle with excellence
[00:58.97]This that brand new reckoning
[01:00.47]If I bring energy to the ‘Couve, that industry gon’ let me in
[01:03.67]I bring white girl, Becky in
[01:05.21]Laid up with a brown girl, Indian
[01:06.87]You know her best friend with her too
[01:08.48]She Lebanese, not lesbian
[01:10.06](Ay ay)
[01:11.07]We go hard in the paint
[01:12.32]Waka Flocka, that flame, yeah
[01:13.95]Midnight on a Monday
[01:15.48]In the club with the gang, yeah
[01:17.02]I just saw and I conquered
[01:18.68]Knew that when I came, yeah
[01:20.34]Feeling great like a dane
[01:21.87]All my dawgs feel the same
[01:23.49]And all my dawgs in the rain
[01:25.07]And we masked up like Bane
[01:26.73]Shout out Mattic, he the Grain
[01:28.38]From the attic to the stage
[01:30.04]Automatic we the wave
[01:31.66]M3, let ‘em rage
[01:33.24]From the heart to the grave
[01:34.90]And they pray it never change
[01:36.80]I’m gone
[01:40.08]Hi everyone, I got a PSA to make
[01:42.83]Just because she has a pretty face
[01:48.97]Does not mean she has a pretty heart
[01:52.54]Fuck these hoes
[01:57.75]All they wanna do is smoke your
[01:59.25]Weed
[02:00.71]Away
[02:02.56]And eat all your
[02:03.57]Food
[02:04.06]Away
[02:06.04]And spend all your
[02:08.18]Money
[02:08.79]Away
[02:09.07]That’s all
[02:09.35]So
[02:09.80]Fuck them bitches`

console.log(result.parsed)
app.listen(port)