const http= require('http');
const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();
const passport = require('./passport');
const db = require('./db')
const path = require('path');
const socketio = require('socket.io');
const request = require('request-promise');
const User = require('./models/user')
const MongoStore = require('connect-mongo')(session);
const compression = require('compression');

const app = express();
const publicPath = path.resolve(__dirname, '..', 'client/dist');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3000; // config variable
const server = http.Server(app);

global.io = socketio(server);
app.set('socketio', global.io);

const api = require('./routes/api');

var sessionStore = new MongoStore({
 mongooseConnection: db
});
app.enable("trust proxy");

if(process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else
      next()
  })
}

app.use(session({
   secret: 'session-secret',
   resave: 'false',
   store: sessionStore,
   saveUninitialized: 'true'
 }));

app.use(passport.initialize());
app.use(passport.session());

app.get(['/u/profile/:user'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/login'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/error'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/song/:songid'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/album/:albumid'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/artist/:artistid'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(['/defaultprofileimage'], function (req, res) {
 res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get(
 '/auth/spotify',
 passport.authenticate('spotify', {
   scope: ['user-read-recently-played',"user-read-birthdate", "user-read-email", "user-read-private", 'user-top-read', 'app-remote-control', 'streaming', 'user-modify-playback-state', 'playlist-modify-public', 'user-read-currently-playing'],
   showDialog: true
 }),
 function(req, res) {
   // The request will be redirected to spotify for authentication, so this
   // function will not be called.
 }
);


app.get(
 '/auth/spotify/callback',
 passport.authenticate('spotify', { failureRedirect: '/error' }),
 function(req, res) {
   // Successful authentication, redirect home.

   var top_songs = {
     url: 'https://api.spotify.com/v1/me/top/tracks?limit=20',
     headers: {'Authorization': "Bearer " + req.user.access_token},
     json: true
   };

   var top_artists = {
     url: 'https://api.spotify.com/v1/me/top/artists?limit=20',
     headers: {'Authorization': "Bearer " + req.user.access_token},
     json: true
   };

   var prof = {
     url: 'https://api.spotify.com/v1/me/',
     headers: {'Authorization': "Bearer " + req.user.access_token},
     json: true
   };

   var create_playlist = {
    method: 'POST',
    url: 'https://api.spotify.com/v1/users/'+req.user._id+'/playlists',
    headers: {
      'Authorization': "Bearer " + req.user.access_token,
      'Content-type': 'application/json'
    },
    body: {
      "name": "Groove Suggestions",
      "description": "A playlist curated from your friend suggestions!",
      "public": true
    },
    json: true
 }

   var recently_played = {
     url: 'https://api.spotify.com/v1/me/player/recently-played?type=track&limit=50',
     headers: {'Authorization': "Bearer " + req.user.access_token},
     json: true
   }

   let values= {
     top_songs: request(top_songs),
     top_artists: request(top_artists),
     profInfo: request(prof),
     recently_played: request(recently_played),
   }

  
   // request top songs and save to database


   User.findOne({_id: req.user._id}, (err, profile)=> {
     values.top_songs
     .then(track => {profile.top_songs = track.items})
     .then(() => {return values.top_artists}).then(artist => {profile.top_artists = artist.items})
     .then(() => {return values.profInfo}).then(prof => {profile.spotify_followers = prof.followers.total;
      profile.premium = (prof.product == 'premium' ? true : false)})
      .then(() => { 
        if(profile.suggestion_playlist_id==""||(!profile.suggestion_playlist_id)) {
          return request(create_playlist)
        }
        else {
          return {id: profile.suggestion_playlist_id}
        }
      }).then(playlist => {profile.suggestion_playlist_id = playlist.id})
        .then( () => {return values.recently_played}).then(tracks => {
        var recent_tracks = tracks.items.map(song => {
          return(
            song.track.id
          );
        })
        profile.recently_played_tracks = recent_tracks.filter(function(item, index){
          return recent_tracks.indexOf(item) >= index;
        });
        var recent_artists = [];
        tracks.items.map(song => {
          song.track.artists.map( artist => {
            recent_artists.push(artist.id)
          })
        })
        profile.recently_played_artists = recent_artists.filter(function(item, index){
          return recent_artists.indexOf(item) >= index;
        });
      })
      .then(() => { return Promise.all(
        profile.recently_played_artists.map(artistId => {
        return request({url: 'https://api.spotify.com/v1/artists/' + artistId , headers: {'Authorization': "Bearer " + req.user.access_token}, json: true})
        })).then( artists => {
          var recent_genres = [];
          artists.map( artist => {
            artist.genres.map( genre => {
              recent_genres.push(genre)
            })
          })
          profile.recent_genres = recent_genres.filter(function(item, index){
            return recent_genres.indexOf(item) >= index;
          });
        })})
        .then(() => { return Promise.all(
          profile.recently_played_artists.map(artistId => {
          return request({url: 'https://api.spotify.com/v1/artists/' + artistId +'/related-artists', headers: {'Authorization': "Bearer " + req.user.access_token}, json: true})
          })).then( artists => {
            var related_artists = [];
            artists.map( artist => {
              artist.artists.map( artist => {
                related_artists.push(artist.id)
              })
            })
            profile.related_artists = related_artists.filter(function(item, index){
              return related_artists.indexOf(item) >= index;
            });
          })})
      .then(() => profile.save(() => {res.redirect('/');}))
   })


 });

 app.get('/logout', function(req, res) {
 req.logout();
 res.redirect('/');
});

app.use('/api', api)
app.use(express.static(publicPath));

app.use(function(req, res, next) {
 const err = new Error('Not Found');
 err.status = 404;
 next(err);
});

// route error handler
app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 if (err.status == 404) {
   res.redirect('/error')
 }
 else {res.send({
   status: err.status,
   message: err.message,
 })};
});

app.use(compression());

// port config

global.io.on('connection', function (socket) {
  socket.on('notification_read', id => {
    User.findOne({_id: id}, (err, user) => {
      if (user) {
        user.unread_notifications = false;
        user.save() }
      else (console.log('user not found'))
    })
  })
});



server.listen(process.env.PORT || port, function() {
 console.log('Server running on port: ' + port);
});


