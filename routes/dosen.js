const    express = require("express");

const router = express.Router();
//Connect DB

const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");
const config = require("config");

//membuat 1 koneksi
//const conn = mysql.createConnection

const connPoll = mysql.createPool(
{
    connectionLimit: 10,
    host :"localhost",
    database: "spotify",
    user:"root",
    port:"3307",
    password: ""

});

router.get("/", auth, function(req,res) //kalo mau diberi authentication ditambah auth sebelum function
{
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

    //const user = jwt.verify(token, config.get("jwtPrivateKey") )
    //Cara melakukan Querry
    connPoll.getConnection(function(err,conn){
        //kalo error , if error throw error
        if(err) throw err;
        //Callback. ketika sukses mendapat koneksi atau error.
        //setelah mendapatkan koneksi lalu..
            const Queri = "SELECT * from users";
                conn.query(Queri,function(err,result){
                    conn.release();//biar tidak memenuhi antrian
                        if(err) throw err;
                        res.send(result);
                });
    });

});

router.get("/:kode", function(req,res)
{
    //Cara melakukan Querry
    connPoll.getConnection(function(err,conn){
        //kalo error , if error throw error
        if(err) throw err;
        //Callback. ketika sukses mendapat koneksi atau error.
        //setelah mendapatkan koneksi lalu..
            const Queri = "SELECT * from dosen where kode ='"+req.params.kode+"'";
                conn.query(Queri,function(err,result){
                    conn.release();//biar tidak memenuhi antrian
                        if(err) throw err;
                        res.send(result);
                });
    });

});





router.post("/",function(req,res){
//nambah data

                    const dosen = {
                        kode: req.body.kode,
                        nama:req.body.nama,
                        tahun: req.body.tahun,
                        gender:req.body.gender

                    }

        connPoll.getConnection(function(err,conn){
            //kalo error , if error throw error
            if(err) throw err;
            //Callback. ketika sukses mendapat koneksi atau error.
            //setelah mendapatkan koneksi lalu..
            const Queri = `INSERT Into dosen values ('${dosen.kode}','${dosen.nama}',${dosen.tahun},${dosen.gender})`;
                    conn.query(Queri,function(err,result){
                        conn.release();//biar tidak memenuhi antrian
                            if(err) throw err;
                            res.send(result);
                    });
        });



});
//{"kode":"D300","nama":"Jonny","tahun":2010,"gender":0}

module.exports = router;