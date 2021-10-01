
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

const lrc = `
'offset':'-1250'
[00:00.00]{Intro}
[00:14.33]Halos on the whip, oh, I’m speeding
[00:16.48]We go up, oh, like every weekend
[00:18.26]Bad as hell, you know I’m a demon
[00:20.05]Sad as hell, you got no achievements
[00:22.15]I been plotting on this forever
[00:24.01]I want rocks in a brand new bezel
[00:25.95]Fuck my opps, they not on my level
[00:27.68]I been feeling like I’m the devil
[00:29.54]You better watch this shit
[00:31.44]Might buy the block with this shit
[00:33.26]Still interlocking double g’s on my Gucci pendant
[00:36.70]Still going stupid, I’m lit
[00:39.17]You still assuming that you winning
[00:41.39]Underdogs from the underworld, we been sinning
[00:43.94]We winning, yeah


[00:45.20]Still whipping out old E90s
[00:46.98]Y’all wanna rock out, come find me
[00:48.48]Bring the whole block out, go crazy
[00:50.30]You know off Azul, I get wavy
[00:52.28]I been sweating like еphedrine dead-ing somе veterans
[00:54.38]Administering venom, we never ride in a Benz
[00:56.32]Manifest a midnight blue, fully matte-ed out Jeep
[00:58.61]off shit we did in the middle of Knight street
[01:00.52]I’m gone
[01:01.41]Back to the woods
[01:02.66]Back to the- back to the goods
[01:04.44]Turned our back on the light
[01:06.05]Went through dark, now it’s back to the good
[01:07.96]All my fallen angels
[01:10.06]They might never get halos
[01:12.21]Might never get our heads right
[01:13.79]So we put that shit on our headlights


[01:15.65]Halos on the whip, oh, I’m speeding
[01:17.28]We go up, oh, like every weekend
[01:19.21]Bad as hell, you know I’m a demon
[01:21.20]Sad as hell, you got no achievements
[01:23.15]I been plotting on this forever
[01:25.01]I want rocks in a brand new bezel
[01:26.99]Fuck my opps, they not on my level
[01:28.77]I been feeling like I’m the devil
[01:30.76]You better watch this shit
[01:32.45]Might buy the block with this shit
[01:34.35]Still interlocking double g’s on my Gucci pendant
[01:38.28]Still going stupid, I’m lit
[01:40.02]You still assuming that you winning
[01:42.49]Underdogs from the underworld, we been sinning
[01:45.07]We winning, yeah

[01:46.25]Car so sick that it’s carcinogenic
[01:47.83]Darkened apartments are my new aesthetic,
[01:49.77]if she with me, gotta be photogenic,
[01:51.63]halos on me couldn’t be mo’ angelic,
[01:53.61]my bitch bad like the necronomicon and my whip fast like ramadan,
[01:57.45]that new hood phenomenon, we got germans swerving like autobahn
[02:01.10]You winning, that shit is unlike-ly
[02:03.41]I benefit, when they get feisty
[02:05.51]And drama, that shit is unlike me
[02:07.97]I’m better than them and I might be
[02:09.42]Cut like incisions, out literal diamonds, material wealth and I gotta go find it
[02:13.22]Only one out here still doing this shit
[02:15.03]I know you heard all the rumours lil bitch


[02:17.22]Halos, headlights
[02:19.16]Book of the dead, got Deadites
[02:20.90]Fiending, you itching like head lice
[02:22.93]Roadblocks, running red lights
[02:24.74]Got that spark like Autobots, we don’t gotta drive it, autonomous
[02:28.43]I’m in the parking lot with the Nazgûl, hoods on and we ominous


[02:31.98]Halos on the whip, oh, I’m speeding
[02:33.64]We go up, oh, like every weekend
[02:35.46]Bad as hell, you know I’m a demon
[02:37.36]Sad as hell, you got no achievements
[02:39.26]I been plotting on this forever
[02:41.32]I want rocks in a brand new bezel
[02:43.14]Fuck my opps, they not on my level
[02:44.97]I been feeling like I’m the devil
[02:46.91]You better watch this shit
[02:48.68]Might buy the block with this shit
[02:50.79]Still interlocking double g’s on my Gucci pendant
[02:54.50]Still going stupid, I’m lit
[02:56.72]You still assuming that you winning
[02:58.74]Underdogs from the underworld, we been sinning
[03:01.57]We winning, yeah`

console.log(result.parsed)
app.listen(port)