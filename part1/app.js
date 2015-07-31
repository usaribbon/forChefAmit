var express = require('express'),
app = express(),
util = require('util');

app.path = path = require('path');
app.jsHandler = jsHandler = '';

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

/*** Mongo DB ***/
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var foodSchema = new Schema({
      name: String,
      quantity: Number,
      created_at: Date
      //updated_at: Date
    });
    mongoose.model('Food', foodSchema);

var db = mongoose.createConnection('mongodb://localhost/fooddb'),
    Food = db.model('Food');
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
    Food.find({}).sort('-created_at').exec(function (err, foodList){
      res.render('index', 
        {foods: foodList}
      );
    });
  });

  app.post('/add', function (req, res) {
    var newFood = req.body;
    Food.create(
      {
        name: newFood.name,
        quantity: newFood.quantity,
        created_at: Date.now()
      }
      , function(err, result) {
        if (err) {
          console.log('Error: ' + result + ' has been failt to insert.');
        } else {
          console.log('Success: ' + result + ' has been inserted');
        }
    });
    res.redirect('/');
  });

  app.post('/update', function (req, res) {
    var food = req.body;
    Food.update({_id:food.id},
      {
        name: food.name,
        quantity: food.quantity
      }
      , function(err, result) {
      if (err) {
        console.log('Error: ' + result + ' has been failt to change.')
      } else {
        console.log('Success: ' + result + ' has been changed');
      }
    });
    res.redirect('/');
  });

  app.post('/del', function (req, res) {
    var id = req.body.id;
    Food.findByIdAndRemove(id, function(err, result) {
      if (err) {
        console.log('Error: ' + result + ' has been failt to delete.')
      } else {
        console.log('Success: ' + result + ' has been deleted');
      }
    });
    res.redirect('/');
  });

  /*
    Starting app
  */
  var server = app.listen(7000, function () {
    console.log('Server is running on  ' + server.address().address + ':' + server.address().port);
  });
});

