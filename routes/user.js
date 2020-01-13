const    express = require("express");
const router = express.Router();
//Connect DB
const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const config = require("config");

const request = require('request'); 
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

//console.log(config.get("jwtPrivateKey"))

//membuat 1 koneksi
//const conn = mysql.createConnection

const connPoll = mysql.createPool(
{
    connectionLimit: 10,
    host :"localhost",
    database: "spotify",
    user:"root",
    port:"3306",
    password: ""

});

const client_id = '1f8e2a0f6f6c4e5c903a2a83be9e8446'; //id app spotify
const client_secret = 'c6f5f9ec63584f19997b61d10a1447c3'; 
const redirect_uri = 'http://localhost:3000/api/user/callback'; 
var user_id_app = null;
    
router.post("/register", function(req,res)
{ 
    //Cara melakukan Querry
   
    connPoll.getConnection(async function(err,conn){
        //kalo error , if error throw error
        if(err) throw err;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.user_password, salt);
        //Callback. ketika sukses mendapat koneksi atau error.
        //setelah mendapatkan koneksi lalu..
        const query = `insert into users (user_name,user_password) values ('${req.body.user_name}','${hashed}')`;
        conn.query(query,function(err,result){
            conn.release();
            if(err) throw err;
            res.status(201).send({"username":req.body.user_name});
        });

    });

});

router.post("/login", function(req,res){
    connPoll.getConnection(async function(err,conn){
        //kalo error , if error throw error
        if(err) throw err;
        
        //Callback. ketika sukses mendapat koneksi atau error.
        //setelah mendapatkan koneksi lalu..
        const query = `select * from users where user_name = '${req.body.user_name}'`;
       
        conn.query(query,async function(err,result){
            conn.release();
            if(err) throw err;
            if(result.length<=0){
                return res.status(400).send("Username dan Password salah!")
            }
            else{
                const user = result[0];
                if(await bcrypt.compare(req.body.user_password, user["user_password"]))
                {
                    const token = jwt.sign({
                        "user_name":user.user_name
                    }, config.get("jwtPrivateKey"), { expiresIn: '1h' })
                    
                    return res.status(200).send(token);
                    //return res.status(201).send(result); Menampilkan username dan password
                }
                else{
                    return res.status(400).send("Username dan Password salah!")
                }
            }
        });
    });
});


var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var stateKey = 'spotify_auth_state';


router.get("/login_spotify", function(req,res)
{ 
    // const token = req.header("x-auth-token")
    // if(!token){
    //     return res.status(401).send("No token")
    // }

    // let user={}
    // try{
    //     user = jwt.verify(token, config.get("jwtPrivateKey"))
    // }
    // catch (ex){
    //     return res.status(400).send("invalid token")
    // }
  
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    var scope = 'playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


router.get("/token_spotify", function(req,res){
    res.send("Access Token = "+req.query.access_token+"<br>Refresh Token = "+req.query.refresh_token+"<br>User ID = "+req.query.user_id);
});

router.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter
  
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = state;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        
        let user_id = '';

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          user_id = body.id;
          res.redirect('http://localhost:3000/api/user/token_spotify?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token,
            user_id: user_id
          }));
        });

        // we can also pass the token to the browser to make requests from there
       
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

router.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


// MELIHAT PLAYLIST
router.get('/playlist:user_id', function(req, res) {
  connPoll.getConnection(function(err,conn){
    //kalo error , if error throw error
    if(err) throw err;
    //Callback. ketika sukses mendapat koneksi atau error.
    //setelah mendapatkan koneksi lalu..
        const Queri = "SELECT * from playlist WHERE user_id ='"+req.params.user_id+"'";
            conn.query(Queri,function(err,result){
                conn.release();//biar tidak memenuhi antrian
                    if(err) throw err;
                    res.send(result);
            });
  });
});


// membuat playlist
router.post('/playlist', function(req, res) {

  const access_token = req.body.access_token;
  const refresh_token = req.body.refresh_token;
  const user_id = req.body.user_id;
  const name_playlist = req.body.name_playlist;
  const description_playlist = req.body.description_playlist;
  
  var options = {
    url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
    headers: { 
      "Authorization": 'Bearer '+access_token,
      "Content-Type" : 'application/json'
    },
    body:{
      "name" : name_playlist,
      "description": description_playlist
    },
    json: true
  };
  // use the access token to access the Spotify Web API
  request.post(options, function(error, response, body) {
    if (!error ) {
      var id_playlist = body.id;
      var name_playlist = body.name;
      connPoll.getConnection(async function(err,conn){
        //kalo error , if error throw error
          if(err) throw err;
          const query = `insert into playlist (playlist_id,playlist_name,playlist_description) values ('${id_playlist}','${name_playlist}','${description_playlist}')`;
          conn.query(query,function(err,result){
              conn.release();
              if(err) throw err;
              res.status(201).send({"id_playlist":id_playlist});
          });
      });
    }
    else{
      res.send({
        'error': body.error.message
      });
    }
  });
});

//UBAH PLAYLIST
router.put('/playlist', function(req, res) {

  const access_token = req.body.access_token;
  const refresh_token = req.body.refresh_token;
  const user_id = req.body.user_id;
  const name_playlist = req.body.name_playlist;
  const description_playlist = req.body.description_playlist;
  const id_playlist = req.body.id_playlist;
   
  var options = {
    url: 'https://api.spotify.com/v1/playlists/'+id_playlist,
    headers: { 
      "Authorization": 'Bearer '+access_token,
      "Content-Type" : 'application/json'
    },
    body:{
      "name" : name_playlist,
      "description": description_playlist
    },
    json: true
  };
  // use the access token to access the Spotify Web API
  request.put(options, function(error, response, body) {
    if (!error ) {
      //var id_playlist = id_playlist;
      //var name_playlist = name_playlist;
      connPoll.getConnection(async function(err,conn){
        //kalo error , if error throw error
          if(err) throw err;
          const query = `UPDATE playlist SET playlist_name = '${name_playlist}', playlist_description = '${description_playlist}' WHERE playlist_id = '${id_playlist}'`;
          console.log(query)
		  conn.query(query,function(err,result){
              conn.release();
              if(err) throw err;
              res.status(201).send({"id_playlist":id_playlist});
          });
      });
    }
    else{
      res.send({
        'error': body.error.message
      });
    }
  });
});



// TAMBAH KOMENTAR playlist
router.post("/comment_playlist",function(req,res){
  //nambah data
  
  const comment = {
    user_id : 0,
    comment_text: req.body.comment_text,
    playlist_id:req.body.playlist_id
  }

  connPoll.getConnection(function(err,conn){
      //kalo error , if error throw error
      if(err) throw err;
      //Callback. ketika sukses mendapat koneksi atau error.
      //setelah mendapatkan koneksi lalu..
      const Queri = `INSERT Into comment (user_id,comment_text,playlist_id) values ('${comment.user_id}','${comment.comment_text}','${comment.playlist_id}')`;
      conn.query(Queri,function(err,result){
          conn.release();//biar tidak memenuhi antrian
              if(err) throw err;
              res.send(result);
      });
  });  
});

// EDIT KOMENTAR playlist
router.put("/comment_playlist",function(req,res){
  //nambah data
  
  const comment = {
    comment_id: req.body.comment_id,
    user_id : 0,
    comment_text: req.body.comment_text,
    playlist_id:req.body.playlist_id
  }

  connPoll.getConnection(function(err,conn){
      //kalo error , if error throw error
      if(err) throw err;
      //Callback. ketika sukses mendapat koneksi atau error.
      //setelah mendapatkan koneksi lalu..
      const Queri = `UPDATE comment SET comment_text='${comment.comment_text}' WHERE comment_id = ${comment.comment_id}`;
      conn.query(Queri,function(err,result){
          conn.release();//biar tidak memenuhi antrian
              if(err) throw err;
              res.send(result);
      });
  });  
});

// DELETE KOMENTAR PLAYLIST
router.delete("/comment_playlist",function(req,res){
  //nambah data
  
  const comment = {
    comment_id: req.body.comment_id
  }

  connPoll.getConnection(function(err,conn){
      //kalo error , if error throw error
      if(err) throw err;
      //Callback. ketika sukses mendapat koneksi atau error.
      //setelah mendapatkan koneksi lalu..
      const Queri = `DELETE from comment WHERE comment_id = ${comment.comment_id}`;
      conn.query(Queri,function(err,result){
          conn.release();//biar tidak memenuhi antrian
              if(err) throw err;
              res.send(result);
      });
  });  
});

module.exports = router;

