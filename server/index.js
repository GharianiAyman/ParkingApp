const express = require("express");
const app = express();

const bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectID;

var jwt = require('jsonwebtoken');
var token_sig = 'pjezfpjajfajeipjfez4845as5';

// --- /Multer ----







var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 3333 });




const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions)) // Use this after the variable declaration

//var fs = require('fs');
const console = require("console");
//const { isWindows } = require("nodemon/lib/utils");
//const { off } = require("process");

const MongoClient = require('mongodb').MongoClient;
//const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';

// On ouvre une connexion à notre base de données
MongoClient.connect(url)
  // On commence par récupérer la collection que l'on va utiliser et la passer
  .then(function (client) {
    return client.db("parking");
  })
  .then((db) => {

    //web_socket 

    wss.on('connection', (socket) => {// traitement si un client connect sur le serveur
      socket.on('message', (msg) => {// traitement à la reception d'un message
        
        const msg1 = JSON.parse(msg);
        free = parseInt(msg1.free)
        date_D = new Date();
        date = {};
        date.secondes = date_D.getSeconds();
        date.minutes = date_D.getMinutes();
        date.hours = date_D.getHours();
        date.year = date_D.getFullYear();
        date.month = date_D.getMonth() + 1;
        date.day = date_D.getDate();       
        if(msg1.type === "in" && msg1.free < msg1.spots)
        {
        msg1.free = free + 1 ; 
        date.free = msg1.free;
        db.collection("parking").updateOne({ "_id": ObjectId(msg1._id) }, {
          $set: {
             "free": msg1.free,
          },
          $push: { "history_in": date }

        }, (insertOne_err, insertOne_res) => {
          if (insertOne_err) {
            console.log(insertOne_err);
            //res.json({ msg: 'Uknown problem' });
          } else {
            //res.json({ msg: '0' });
            console.log(msg1.title + " ==> updated")
          }
        });
      }
        else if ( msg1.type === "out" && msg1.free > 0)
        {
        msg1.free = free - 1 ;
        date.free = msg1.free;
        db.collection("parking").updateOne({ "_id": ObjectId(msg1._id) }, {
          $set: {
             "free": msg1.free,
          },
          $push: { "history_out": date }

        }, (insertOne_err, insertOne_res) => {
          if (insertOne_err) {
            console.log(insertOne_err);
            //res.json({ msg: 'Uknown problem' });
          } else {
            //res.json({ msg: '0' });
            console.log(msg1.title + " ==> updated")
          }
        });
      }
        console.log( "free ==> " + msg1.free ); 
        wss.clients.forEach(function each(client) {    
          if (client.readyState == 1) {
            client.send(JSON.stringify (msg1)); // l'envoie de la modification à tous les clients
          }
        });
    
      });
    
    
    });


    // Rajouter vos routes et les traitements
    // just for test in dev mode
    app.get('/welcome', (req, res) => {
      console.log('welcome')
      res.json({ respond: "Hello_World" });
    });

    app.post('/Parking/add', (req, res) => {

      client = {
        coordinate: {}
      }
      coordinate = {}
      coordinate.latitude = parseFloat(req.body.Lat);
      coordinate.longitude = parseFloat(req.body.Long);
      client.id = 1 ; 
      db.collection("parking").find().sort({ "id": -1 }).limit(1).toArray(async (err, parking) => {
         client.id = parking[0].id + 1;
      })
      client.id = client.id ; 
      client.history_in = [];
      client.history_out = [];
      client.title = req.body.name;
      client.spots = req.body.capacite;
      client.free = req.body.capacite;
      client.coordinate = coordinate;
      client.description = req.body.description;
      client.type = req.body.type;

      // verify email uniqueness
      db.collection("parking").findOne(
        { "name": req.body.name },
        (err, cl) => {
          if (cl) {
            res.json({ msg: 'name already used' });
          } else {

            db.collection("parking").insertOne(client, (insertOne_err, insertOne_res) => {
              if (insertOne_err) {
                console.log(insertOne_err);
                res.json({ msg: 'Uknown problem' });
              } else {
                res.json({ msg: '0' });
                console.log(req.body.name + " ==> added")
              }
            });

          }
        }
      )

    });
    app.post('/Parking/update', (req, res) => {

      client = {
        coordinate: {}
      }
      coordinate = {}
      coordinate.latitude = parseFloat(req.body.Lat);
      coordinate.longitude = parseFloat(req.body.Long);
      client.title = req.body.name;
      client.spots = req.body.capacite;
      client.free = req.body.free;
      client.coordinate = coordinate;
      client.description = req.body.description;
      client.type = req.body.type;

      //console.log(client)
      db.collection("parking").updateOne({ "_id": ObjectId(req.body.id) }, {
        $set: {
          "title": client.title,
          "spots": client.spots, "free": client.free, "coordinate": client.coordinate,
          "description": client.description,"type":client.type
        }
      }, (insertOne_err, insertOne_res) => {
        if (insertOne_err) {
          console.log(insertOne_err);
          res.json({ msg: 'Uknown problem' });
        } else {
          res.json({ msg: '0' });
          console.log(req.body.name + " ==> updated")
        }
      });
    });
    app.post('/Parking/update/in', (req, res) => {


      item = {};
      date = {}
      console.log("here_in")
      item._id = req.body._id;
      date.secondes = req.body.secondes;
      date.minutes = req.body.minutes;
      date.hours = req.body.hours;
      date.year = req.body.year;
      date.month = req.body.month;
      date.day = req.body.day;
      date.free = req.body.free
      db.collection("parking").updateOne({ "_id": ObjectId(req.body._id) }, { $push: { "history_in": date } }, (insertOne_err, insertOne_res) => {
        if (insertOne_err) {
          console.log(insertOne_err);
          res.json({ msg: 'Uknown problem' });
        } else {
          res.json({ msg: '0' });
          console.log(req.body.item + " ==> updated")
        }
      });
    });
    app.post('/Parking/update/out', (req, res) => {


      item = {};
      date = {}
      console.log("here_out")
      item._id = req.body._id;
      date.secondes = req.body.secondes;
      date.minutes = req.body.minutes;
      date.hours = req.body.hours;
      date.year = req.body.year;
      date.month = req.body.month;
      date.day = req.body.day;
      date.free = req.body.free
      db.collection("parking").updateOne({ "_id": ObjectId(req.body._id) }, { $push: { "history_out": date } }, (insertOne_err, insertOne_res) => {
        if (insertOne_err) {
          console.log(insertOne_err);
          res.json({ msg: 'Uknown problem' });
        } else {
          res.json({ msg: '0' });
          console.log(req.body.item + " ==> updated")
        }
      });
    });
    app.post('/User/update', (req, res) => {

      client = {
      }
      client.username = req.body.username;
      client.email = req.body.email;
      console.log(client)
      db.collection("users").updateOne({ "_id": ObjectId(req.body.id) }, {
        $set: {
          "username": client.username,
          "email": client.email
        }
      }, (insertOne_err, insertOne_res) => {
        if (insertOne_err) {
          console.log(insertOne_err);
          res.json({ msg: 'Uknown problem' });
        } else {
          res.json({ msg: '0' });
          console.log(req.body.name + " ==> updated")
        }
      });
    });
    app.post('/Parking/get', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parkings = []
      console.log("here get parkings")
      jwt.verify(req.body.token, token_sig, (err, user) => {

        db.collection("parking").find({}).toArray(async (err, parking) => {
          res.json({ parking: parking });
        })

      });

    });
    app.post('/Parking/get_capteur', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parkings = []
      console.log("here get parkings")

        db.collection("parking").find({}).toArray(async (err, parking) => {
          res.json({ parking: parking });
        })


    });
    app.post('/User/get', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parkings = []
      console.log("here get Users")
      jwt.verify(req.body.token, token_sig, (err, user) => {

        db.collection("users").find({}).toArray(async (err, User) => {
          res.json({ User: User });
        })

      });
    });
    app.post('/Statistics/get', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parking_stat = {};
      console.log("here get stat")
      jwt.verify(req.body.token, token_sig, (err, user) => {
        first_date = JSON.parse(req.body.first_date_json);
        second_date = JSON.parse(req.body.second_date_json);
        db.collection("parking").find({ "_id": ObjectId(req.body._id) }).toArray(async (err, parking) => {
          parking_stat.spots = parking[0].spots;
          parking_stat.free = parking[0].free;
          parking_stat.title = parking[0].title;
          parking_stat.total_ooccuped = 0;
          parking_stat.free_history = [];
          parking_stat.free_history_id = [];
          parking_stat.free_history_free = [];
          //console.log( parking[0].history_in )
          //console.log( parking[0].history_out )
          element_in = parking[0].history_in;
          element_out = parking[0].history_out;
          first_date_date = new Date(first_date.year, first_date.month, first_date.day, first_date.hours, first_date.minutes,
            first_date.secondes)
          second_date_date = new Date(second_date.year, second_date.month, second_date.day, second_date.hours, second_date.minutes,
            second_date.secondes)
          parking_stat.total = parseInt( parking_stat.spots )*(second_date_date.getTime() - first_date_date.getTime())/1000;
          for (const key_in in element_in) {
            tmp_date_in = new Date(element_in[key_in].year, element_in[key_in].month, element_in[key_in].day, element_in[key_in].hours, element_in[key_in].minutes,
              element_in[key_in].secondes)
            if (first_date_date.getTime() - tmp_date_in.getTime() < 0 && second_date_date.getTime() - tmp_date_in.getTime() > 0) {
              object_2 = {};
              object_2.id = tmp_date_in;
              object_2.free = element_in[key_in].free;
              parking_stat.free_history.push(object_2);
            }
            for (const key_out in element_out) {
              tmp_date_out = new Date(element_out[key_out].year, element_out[key_out].month, element_out[key_out].day, element_out[key_out].hours,
                element_out[key_out].minutes, element_out[key_out].secondes)
              if (first_date_date.getTime() - tmp_date_in.getTime() < 0 && first_date_date.getTime() - tmp_date_out.getTime() < 0
                && second_date_date.getTime() - tmp_date_in.getTime() > 0 && second_date_date.getTime() - tmp_date_out.getTime() > 0) {

                if (tmp_date_out.getTime() - tmp_date_in.getTime() > 0) {
                  diff = (tmp_date_out.getTime() - tmp_date_in.getTime()) / 1000;
                  parking_stat.total_ooccuped += diff;
                  console.log(" diff ==  "+diff)
                  object_1 = {};
                  object_1.id = tmp_date_out;
                  object_1.free = element_out[key_out].free;
                  parking_stat.free_history.push(object_1);

                  element_in.splice(key_in, 1);
                  element_out.splice(key_out, 1);
                  //console.log("here 2")                

                }
              }
            }
          }
          for (const key_in in element_in) {
            tmp_date_in = new Date(element_in[key_in].year, element_in[key_in].month, element_in[key_in].day, element_in[key_in].hours, element_in[key_in].minutes,
              element_in[key_in].secondes)
            if (first_date_date.getTime() - tmp_date_in.getTime() < 0 && second_date_date.getTime() - tmp_date_in.getTime() > 0) {
              object_2 = {};
              object_2.id = tmp_date_in;
              object_2.free = element_in[key_in].free;
              parking_stat.free_history.push(object_2);
            }
            for (const key_out in element_out) {
              tmp_date_out = new Date(element_out[key_out].year, element_out[key_out].month, element_out[key_out].day, element_out[key_out].hours,
                element_out[key_out].minutes, element_out[key_out].secondes)
              if (first_date_date.getTime() - tmp_date_in.getTime() < 0 && first_date_date.getTime() - tmp_date_out.getTime() < 0
                && second_date_date.getTime() - tmp_date_in.getTime() > 0 && second_date_date.getTime() - tmp_date_out.getTime() > 0) {

                if (tmp_date_out.getTime() - tmp_date_in.getTime() > 0) {
                  diff = (tmp_date_out.getTime() - tmp_date_in.getTime()) / 1000;
                  console.log(" diff ==  "+diff)
                  parking_stat.total_ooccuped += diff;
                  object_1 = {};
                  object_1.id = tmp_date_out;
                  object_1.free = element_out[key_out].free;
                  parking_stat.free_history.push(object_1);

                  element_in.splice(key_in, 1);
                  element_out.splice(key_out, 1);
                  //console.log("here 2")                

                }
              }
            }
          }
          parking_stat.free_history.sort(function (a, b) {
            return a.id - b.id;
          });   
          max_free = 0 ; 
          console.log("here");
          for (const key in parking_stat.free_history) {
            if (max_free <  parseInt (parking_stat.free_history[key].free) )
            {
              max_free = parseInt (parking_stat.free_history[key].free);
            }
            parking_stat.free_history_free.push(parking_stat.free_history[key].free);
            if ( key == 0 )
            parking_stat.free_history_id.push("          "+parking_stat.free_history[key].id.toISOString());
            else if ( key == parking_stat.free_history.length - 1  )
            parking_stat.free_history_id.push(parking_stat.free_history[key].id.toISOString()+"                                      ");
            else 
            parking_stat.free_history_id.push("");

          }
          parking_stat.total_ooccuped += Math.abs(parking_stat.spots  - max_free) * 24 * 3600;
          console.log( " total occuped ==  " +parking_stat.total_ooccuped)
          console.log(" total  ==  " +parking_stat.total)
          parking_stat.pourcentage_occuped = Math.round(parking_stat.total_ooccuped / (parking_stat.total) *100000 ) /1000 ;
          console.log( " total occuped ==  " + parking_stat.pourcentage_occuped  )
          if ( parking_stat.pourcentage_occuped > 100 ) parking_stat.pourcentage_occuped  = 100 - ( parking_stat.free/parking_stat.spots  )* 100;
          else if ( parking_stat.pourcentage_occuped < 0 ) parking_stat.pourcentage_occuped  = 0 
          res.json({ parking: parking_stat });
        })

      });

    });
    app.post('/Parking/getOne', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parkings = []
      console.log("here getOne parking")
      jwt.verify(req.body.token, token_sig, (err, user) => {

        db.collection("parking").find({ "_id": ObjectId(req.body.id) }).toArray(async (err, parking) => {
          res.json({ client: parking[0] });
        })

      });

    });
    app.post('/User/getOne', (req, res) => {

      /*
        curl
          -X POST 
          -d 'token=lora17@yml.fr'
          http://localhost:3000/users/profile
      */

      parkings = []
      console.log("here getOne user")
      jwt.verify(req.body.token, token_sig, (err, user) => {

        db.collection("users").find({ "_id": ObjectId(req.body.id) }).toArray(async (err, parking) => {
          res.json({ client: parking[0] });
        })

      });

    });

    app.post('/Parking/delete', (req, res) => {
      jwt.verify(req.body.token, token_sig, (err, user) => {
        console.log("here delete parking")
        console.log(req.body.id);
        db.collection("parking").deleteOne({ "_id": ObjectId(req.body.id) })
        res.json({ msg: "0" })
      });
    });

    app.post('/User/delete', (req, res) => {
      jwt.verify(req.body.token, token_sig, (err, user) => {
        console.log("here delete user")
        console.log(req.body.id);
        db.collection("users").deleteOne({ "_id": ObjectId(req.body.id) })
        res.json({ msg: "0" })
      });
    });



    app.post('/users/register', (req, res) => {

      client = {}
      console.log("here registred")
      client.username = req.body.username;
      client.email = req.body.email;
      let salt = bcrypt.genSaltSync(10);
      client.hashed_password = bcrypt.hashSync(req.body.password, salt);

      // verify email uniqueness
      db.collection("users").findOne(
        { "email": req.body.email },
        (err, cl) => {
          if (cl) {
            res.json({ msg: 'email already used' });
          } else {

            db.collection("users").insertOne(client, (insertOne_err, insertOne_res) => {
              if (insertOne_err) {
                console.log(insertOne_err);
                res.json({ msg: 'Uknown problem' });
              } else {

                let token_ele = {
                  email: client.email
                }
                let token = jwt.sign(token_ele, token_sig);
                res.json({ msg: '0', token: token });

              }
            });

          }
        }
      )

    });


    app.post('/users/login', (req, res) => {


      console.log('here login');

      db.collection("users").findOne(
        { "email": req.body.email },
        (err, client) => {
          if (client == null) {
            res.json({ msg: 'not registred' });
          } else {

            if (bcrypt.compareSync(req.body.password, client.hashed_password)) {

              let token_ele = {
                email: client.email
              }
              let token = jwt.sign(token_ele, token_sig);
              res.json({ msg: '0', token: token });

            } else {
              res.json({ msg: 'wrong password' });
            }

          }
        }
      )

    });

    // just for test in dev mode
    app.post('/users/is_registered', (req, res) => {

      console.log("here is_registred");
      db.collection("users").findOne(
        { "email": req.body.email },
        (err, client) => {
          if (bcrypt.compareSync(req.body.password, client.hashed_password)) {
            res.send("registerd");
          } else {
            res.send("not_registerd");
          }
        }
      )

    });



    // just for test in dev mode
    app.get('/drop_db', (req, res) => {
      //db.collection('users').drop();
      db.collection('parking').drop();
      res.send("drop_db");
    });

    app.listen(3000, () => {
      console.log("En attente de requêtes...");
    });

  })
  .catch(function (err) {
    throw err;
  });