var express = require('express'),
app = express(),
util = require('util'),
fs = require('fs');

app.path = path = require('path');
app.jsHandler = jsHandler = '';

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

/*** File-based Databese ***/
var jsonFile = __dirname + '/data.json',
    rawJson = fs.readFileSync(jsonFile,'utf8'),
    db = JSON.parse(rawJson);
    //itemNums = Object.keys(db.foodlist).length,

var Food = function (name,quantity){
  this.name = escape(name);
  this.quantity = quantity;
}

function reloadJson(){
  rawJson = fs.readFileSync(jsonFile,'utf8');
  db = JSON.parse(rawJson);
}

function writeJson(){
  fs.writeFileSync(jsonFile, JSON.stringify(db));
}
/****************/

/***** Apps *****/
app.configure(function() {
  app.use(express.urlencoded({
    limit: '10mb'
  }));

  app.use(express.json());

  app.use(express.methodOverride());
  app.use(express.cookieParser('lbajobs'));

  app.use(express.static(__dirname + '/public', {
    maxAge: 86400000, // one day
    redirect: false
  }));
  
  app.get('/', function (req, res) {
    res.render('index', {foods: db.foodlist});
  });

  app.post('/add', function (req, res) {
    var f = req.body;
    var id = 'id_' + new Date().getTime();
    db.foodlist[id] = new Food(f.name,f.quantity);
    writeJson();
    reloadJson();
    res.redirect('/');
  });

  app.post('/update', function (req, res) {
    var f = req.body;
    db.foodlist[f.id] = new Food(f.name,f.quantity);
    writeJson();
    reloadJson();
    res.redirect('/');
  });

  app.get('/del/:id', function (req, res) {
    var id = req.params.id;
    delete db.foodlist[id];
    writeJson();
    reloadJson();
    res.redirect('/');
  });

  /*
    Starting app
  */
  var server = app.listen(7000, function () {
    console.log('Server is running on  ' + server.address().address + ':' + server.address().port);
  });
});

