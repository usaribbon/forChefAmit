var express = require('express'),
app = express(),
util = require('util'),
fs = require('fs');

app.path = path = require('path');
app.jsHandler = jsHandler = '';

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

/*** File-based Database ***/
var JSONFILE = __dirname + '/data.json',
db = loadJson();

var Food = function (name,quantity){
  this.name = escape(name);
  this.quantity = quantity;
}

function sortReverse(hash){
  var keys = [], reversed = {};
  for (var k in hash) keys.push(k);
  keys.reverse();
  for(var i = 0; i < keys.length; i++){
    reversed[keys[i]] = hash[keys[i]];}
  return reversed;
}

function loadJson(){
  var data = JSON.parse(fs.readFileSync(JSONFILE,'utf8'));
  console.log('Database : loaded');
  return sortReverse(data.foodlist);
}

function updateJson(id,food){
  var newdb = {};
  newdb.foodlist = sortReverse(db);
  if(id && food){
    newdb.foodlist[id] = food;
    console.log('Database : updated');}
  else{
    console.log('Database : item deleted');}
  fs.writeFileSync(JSONFILE, JSON.stringify(newdb));
}
/****************/

/*** Pager ***/
var foodIndex = Object.keys(db),
    foodCnt = foodIndex.length;

function Pagination(page){
  var itemNumPerPage = 10;
  
  var maxPage = Math.floor(foodCnt / itemNumPerPage);
  if(page < 0){
    page = 0;}
  else if(page > maxPage){
    page = maxPage;}

  var itemPickFrom = page * itemNumPerPage,
  foodlist = {},
  foodlistlength = 0,
  counter = 0;
  for(var key in db){
    if(counter >= itemPickFrom && foodlistlength < itemNumPerPage){
      foodlist[key] = db[key];
      foodlistlength = Object.keys(foodlist).length;}
    counter++;}

  /* valiables for View */
  var pager = {};
  if(foodlistlength < itemNumPerPage){
    pager.last = true;}
  if(itemPickFrom == 0){
    pager.first = true;}
  pager.previous = page - 1;
  pager.next = page + 1;
  return [foodlist, pager]; 
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
    var page = (req.query.page) ? parseInt(req.query.page) : 0;
    var pager = Pagination(page);
    res.render('index', {foods: pager[0], pager: pager[1]});
  });

  app.post('/add', function (req, res) {
    var f = req.body;
    var id = 'id_' + new Date().getTime();
    food = new Food(f.name,f.quantity);
    updateJson(id, food);
    db = loadJson();
    res.redirect('/');
  });

  app.post('/update', function (req, res) {
    var f = req.body,
    food = new Food(f.name,f.quantity);
    updateJson(f.id, food);
    db = loadJson();
    res.redirect('/');
  });

  app.get('/del/:id', function (req, res) {
    var id = req.params.id;
    delete db[id];
    updateJson(id);
    db = loadJson();
    res.redirect('/');
  });

  /*
    Starting app
  */
  var server = app.listen(7000, function () {
    console.log('Server is running on  ' + server.address().address + ':' + server.address().port);
  });
});

