var express = require('express');
var router = express.Router();
var User = require('../models/user');
var MongoClient = require('mongodb').MongoClient;
var url = require('url');
var bcrypt = require('bcrypt');

var database = "HLWDB";

var uri = 'mongodb://localhost/' + database;

// GET route for reading data
router.get('/', function (req, res, next) {
  res.status(200).send('NodeJS WebService with MongoDB');
  return;
});

// GET route for reading a table
router.get('/read', function(req, res) {
  var table = url.parse(req.url, true).query.table;

  if(table === 'sessions') {
    res.status(401).send('Nicht authorisiert! Andere Tabelle auswählen.');
    return;  
  }

  var uid = url.parse(req.url, true).query.uid;

  User.findById(uid, function (err, result) {
    if(err) {
      res.status(401).send('UID not found;'+err);
      return;
    } else if(!result) {
      res.status(401).send('UID not found');
      return;
    }
      read(res, table);
      return;
  });
});

router.post('/add', function (req, res) {
  var table = url.parse(req.url, true).query.table;

  if(table === 'users' || table === 'sessions') {
    res.status(401).send('Nicht authorisiert! Andere Tabelle auswählen.');
    return;  
  }

  var uid = url.parse(req.url, true).query.uid;

  User.findById(uid, function (err, result) {
    if(err) {
      res.status(401).send('UID not found;'+err);
      return;
    } else if(!result) {
      res.status(401).send('UID not found');
      return;
    }
      create(req, res, table);
      return;
  });
});

router.put('/update', function (req, res) {
  var table = url.parse(req.url, true).query.table;

  if(table === 'users' || table === 'sessions') {
    res.status(401).send('Nicht authorisiert! Andere Tabelle auswählen.');
    return;  
  }

  var uid = url.parse(req.url, true).query.uid;

  User.findById(uid, function (err, result) {
    if(err) {
      res.status(401).send('UID not found;'+err);
      return;
    } else if(!result) {
      res.status(401).send('UID not found');
      return;
    }
      update(req, res, table);
      return;
  });
});

//POST route for login
router.post('/login', function (req, res, next) {
   if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        res.status(401).send('Falsche E-mail! -- Error: ' + error);
        return;
      } else {
        res.status(200).send(
          {
            "state": "succesful", 
            "uid": user._id,
            "uname": user.username
          }
        );
      }
    });
  } else {
    res.status(400).send('Bitte E-mail und Passwort ausfüllen.');
    return;
  }
});

router.delete("/delete", function(req, res) {
  var table = url.parse(req.url, true).query.table;

  if(table.includes("Transaktionen")) {
    res.status(401).send("Nicht berechtigt!");
    return;
  }
  if(table.includes("Rohwaren") || table.includes("Naehseide") || table.includes("Knoepfe") || table.includes("Bundhaken") || table.includes("users")) {
    var uid = url.parse(req.url, true).query.uid;

    User.findById(uid, function (err, result) {
      if(err) {
        res.status(401).send('UID not found;'+err);
        return;
      } else if(!result) {
        res.status(401).send('UID not found');
        return;
      }
        if(table === "users")
          remove(req, res, table, { "email": url.parse(req.url, true).query.email });
        else {
          remove(req, res, table, {"Warengruppe": url.parse(req.url, true).query.warengruppe });
        }
        return;
    });
  } else {
    res.status(401).send("Nicht berechtigt!");
    return;
  }
});

// POST route for signin
router.post('/signin',  function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
      res.status(400).send('Passwörter stimmen nicht überein!');
      return;
    }
  
    if (req.body.email &&
      req.body.username &&
      req.body.password &&
      req.body.passwordConf) {
  
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      }
  
      User.create(userData, function (error, user) {
        if (error) {
            res.status(400).send(error);
            return;
        } else {
          res.status(200).send(
            {
              "uid" : user._id
            }
          );
          return;
        }
      });
  
    } else {
      res.status(400).send('Bitte E-Mail, Name, Passwort und Passwort Wiederholung ausfüllen.');
      return;
    }
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  logout(req, res);
});

function read(res, collection) {
  MongoClient.connect(uri, function (err, client) {
    if (err) {
      res.status(400).send(err);
    } else {
      var db = client.db(database);
      db.collection(collection).find({}).toArray(function (err, result) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(result);
        }
      });
      client.close();
    }
  });
}

function create(req, res, collection) {
  var jsonInsert = req.body;
  
  MongoClient.connect(uri, function (err, client) {
      if (err) {
          res.send(err);
          res.end(400);
      } else {
          var db = client.db(database);

          db.collection(collection).insertOne(jsonInsert, function (err, result) {
              if (err) {
                  res.send(err);
                  res.end(400);
              } else {
                  res.send({state: "Inserted 1 document"});
                  res.end(200);
              }
          });
          client.close();
      }
  });
}

  /* EXAMPLE (Knoepfe)
  {"source": {
    "Warengruppe": "K-B-20",
    "Anzahl in Stk": "532",
    "Unterteile schwarz": "293",
    "Unterteile weiß": "239",
    "Preis": "0,40"
  },
  "destination":{
    "Warengruppe": "K-B-20",
    "Anzahl in Stk": "532",
    "Unterteile schwarz": "293",
    "Unterteile weiß": "239",
    "Preis": "0,45"
  }}
  * 
  */
function update(req, res, collection) {
  var myquery = req.body;
  var sourceValues = myquery.source;
  var newValues = myquery.destination;

  MongoClient.connect(uri, function (err, client) {
      if (err) {
          res.send(err);
          res.end(400);
      } else {
          var db = client.db(database);

          db.collection(collection).updateOne(sourceValues, newValues /*{ name: sourceValues.name }, { $set: newValues }*/, function (err, dbresp) {
              if (err) {
                  res.send(err);
                  res.end(400);
              } else {
                  res.send({state: "1 document updated", updated: newValues, source: sourceValues});
                  res.end(200);
              }
          });
          client.close();
      }
  });
}

function remove(req, res, collection, toDelete) {
  MongoClient.connect(uri, function (err, client) {
      if (err) {
          res.send(err);
          res.end(400);
      } else {

          var db = client.db(database);

          db.collection(collection).deleteOne(toDelete, function (err, obj) {
              if (err) {
                  res.send(err);
                  res.end(400);
              } else {
                  res.send("1 document deleted");
                  res.end(200);
              }
          });
          client.close();
      }
  });
}

function logout(req, res, sid) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        res.status(400).send(err);
        return;
      } else {
        res.status(200).send('Ausgeloggt.');
        return;
      }
    });
  }
}
module.exports = router;