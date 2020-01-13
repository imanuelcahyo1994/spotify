const jwt = require("jsonwebtoken")
const config = require("config")

 function auth(req, res, next){
    //next untuk menentukan kapan untuk lanjut ke berikutnya
     const token = req.header("x-auth-token")
    if(!token){
        return res.status(401).send("No token")
    }

    let user={}
    try{
        user = jwt.verify(token, config.get("jwtPrivateKey"))
    }
    catch (ex){
        return res.status(400).send("invalid token")
    }
    console.log(user)

    next()
 }

module.exports = auth;