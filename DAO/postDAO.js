var mysql = require('mysql');
var moment = require('moment');
var userDao = require('../DAO/userDAO.js');
var postSearchDAO = require('../DAO/postSearchDAO.js');
var cloudinary = require("cloudinary");
var multiparty = require("multiparty");
var apiKey = ['AIzaSyAJZNmL0XqusnUNeGDarIumJNpvHtoCsfw', 'AIzaSyBhhkQrsLDFg8EHBC62YvmuNN72YCTH2mA', 'AIzaSyDjnbNZzGvkCli-IPOWz1vO6oei-TDJT1o', 'AIzaSyAgKyx94f3Fww8E2K2-l9MP4LZh56RHWBE', 'AIzaSyBP6U_BknjXbrX18P1rPwlKQqsy6xlMDrI', 'AIzaSyDXk3sZiFoGP7IJKQn-EjJ8EoxA0Fz5X_w', 'AIzaSyB38TkAKYm6EGz9cUQJPZ90ANqalVGcJPI', 'AIzaSyAZeLDAbb6ChL7_97yRq706Y38N1gbQ2lY', 'AIzaSyBBn5DIJ6keAz-9MXXFcAdZ0O_pGnCvPac'];
var path = require('path');
var GeoPoint = require('geopoint');
var geolib = require('geolib');
var APIONEBATCH = 25;
/* Logger for production
var logger = require('../Service.js').logger('postDao');
console.log = function(info){logger.info(info)}
*/

//AIzaSyDT1vq9gJH-jseTWxh9m44bftW_z-s7gmA 
//AIzaSyDPqWza2RFD9Y50pCyVM98EiPh7jQmvUo8


// key 0
// AIzaSyAJZNmL0XqusnUNeGDarIumJNpvHtoCsfw
// key 1
// AIzaSyBhhkQrsLDFg8EHBC62YvmuNN72YCTH2mA

// key 2
// AIzaSyDjnbNZzGvkCli-IPOWz1vO6oei-TDJT1o

// key 3
// AIzaSyAgKyx94f3Fww8E2K2-l9MP4LZh56RHWBE

const fs = require('fs');

var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

var Sequelize = require('sequelize');
var sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging: false,
    dialectOptions: {
      ssl: true
  }
});

var Posts = sequelize.define('Posts', {
 userId: {
    type: Sequelize.STRING,
    allowNull: false
},
title: {
  type: Sequelize.STRING,
  allowNull: false
},
postCode: {
  type: Sequelize.STRING,
  allowNull: false
},
price : {
  type: Sequelize.INTEGER
},
postDescription: {
	type: Sequelize.TEXT
},
type: {
  type: Sequelize.STRING,
  allowNull: false
},
bedroomNumber:{
  type: Sequelize.INTEGER,
  allowNull: false
},
washroomNumber:{
  type: Sequelize.INTEGER,
  allowNull: false
},
livingroomNumber:{
  type: Sequelize.INTEGER
},
denNumber:{
  type: Sequelize.INTEGER
},
parking:{
  type: Sequelize.INTEGER
},
size:{
  type: Sequelize.INTEGER
},
leaseTerm:{
  type: Sequelize.INTEGER
},
address: {
  type: Sequelize.STRING/*,
  allowNull: false*/
},
unit: {
  type: Sequelize.INTEGER
},
latitude: {
    type: Sequelize.DOUBLE,
    allowNull: false
},
longitude: {
    type: Sequelize.DOUBLE,
    allowNull: false
},
city:{
    type: Sequelize.STRING
},
province:{
    type: Sequelize.STRING
},
country:{
    type: Sequelize.STRING
},
postCode:{
    type: Sequelize.STRING
},
startingDate: {
	type: Sequelize.INTEGER,
	allowNull: false
},
occupation: {
  type: Sequelize.STRING
},
isPetAllowed: {
  type: Sequelize.BOOLEAN
 },
isSingleOnly: {
  type: Sequelize.BOOLEAN
},
isJointAllowed: {
	type: Sequelize.BOOLEAN
},
gender: {
  type: Sequelize.STRING
},
isCloseSubway: {
  type: Sequelize.BOOLEAN
},
isFurnitureProvided: {
  type: Sequelize.BOOLEAN
},
hasGym: {
  type: Sequelize.BOOLEAN
},
hasBath: {
  type: Sequelize.BOOLEAN
},
images: {
    type: Sequelize.ARRAY(Sequelize.STRING)
},
email:{
    type: Sequelize.STRING
},
phoneNumber:{
    type: Sequelize.STRING
},
otherContact: {
  type: Sequelize.STRING
}


 // Not implemented: 
 // 1. Images: maybe saved as array of image ids
 // 2. Request: maybe saved as hashtag

}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

function returnBatches(posts){
	var oneBatch = APIONEBATCH;
	var savedBatch = 0;
	var numberLeft = posts.length;
	var numberSaved = 0;
	var wholeBatches = [];
	while (oneBatch <= numberLeft){
		// pack one batch
		var thisBatch = [];
		for (var i=0; i<oneBatch; i++){
            var post = posts[numberSaved+i];
            thisBatch.push(post);
        }
        wholeBatches.push(thisBatch);
        numberLeft = numberLeft - oneBatch;
        numberSaved = numberSaved + oneBatch;
        savedBatch = savedBatch + 1;
    }
    if (numberLeft != 0){
      var thisBatch = [];
      for (var i=0; i<numberLeft; i++){
       thisBatch.push(posts[savedBatch * oneBatch + i]);
   }
   wholeBatches.push(thisBatch);
}
console.log("===========================");

return wholeBatches;
}

var postsWithinDistance = [];
var checker = 0;

function rankAllPostsByDistance(posts, req, latitude, longitude, postsLength, batch, thePassedKey, next){
    checker = 0;
    var origin = [latitude + "," + longitude];
    var APIOneBatch = APIONEBATCH;

    var batches = Math.ceil(posts.length/APIOneBatch);  //  8/3 -> 3
    //batches = 20;
    console.log("batches: " + batches);

    for (var order=0; order<batches; order++){
        rankOneBatchPosts(posts, batch, origin, order, postsLength, APIOneBatch, batches, req, thePassedKey, next);
    }
}

var errorOrders = [];

function rankOneBatchPosts(posts, batch, origin, order, postsLength, APIOneBatch, batches, req, thePassedKey, next){
    var dests = [];
    // not the last batch
    if (order < (batches-1)){
        for (var i=0; i<APIOneBatch; i++){
            dests.push(posts[order*APIOneBatch+i].latitude + "," + posts[order*APIOneBatch+i].longitude);
        }
    }
    // the last batch
    else{
        var rest = postsLength - order*APIOneBatch;

        for (var i=0; i<rest; i++){
            dests.push(posts[order*APIOneBatch+i].latitude + "," + posts[order*APIOneBatch+i].longitude);
        }
    }
    var data = [];
    dests.forEach(function(value){
        var distance = geolib.getDistanceSimple(
            {latitude: origin[0].split(",")[0], longitude: origin[0].split(",")[1]},
            {latitude: parseFloat(value.split(",")[0]), longitude: parseFloat(value.split(",")[1])}, 100);
        data.push(distance+100);
    });
    for (var i=0; i<data.length; i++){
        postsWithinDistance.push([posts[order*APIOneBatch+i].id, data[i]]);
    }
    checker += 1;

    if (checker == batches){

        postsWithinDistance.sort(comparePostDistance);
        // format like wholeBatches = [    [ [ 64, 100 ], [ 68, 1800 ], ...... ], [ [ 64, 100 ], [ 68, 1800 ], ...... ] .....      ]
        var wholeBatches = returnBatches(postsWithinDistance);

        if (batch < wholeBatches.length){
            req.posts = wholeBatches[batch];
        }
        else{
            req.posts = [];                
        }
        
        var postSearch = postSearchDAO.getSelf;
        postSearch.sync({force: false}).then(function () {
            console.log("creation in postSearch");
            console.log("creation key: " + thePassedKey);
            return postSearch.create({
                conditions: thePassedKey,
                posts: JSON.stringify(wholeBatches)
            });
        }); 
        for (var i=0; i<errorOrders; i++){
            console.log(order);
        }
        next();
    }
}



function comparePostDistance(postA, postB){
    return postA[1] - postB[1];
}



var User = userDao.getSelf;

module.exports = {
    getSelf: Posts,
    getByID:function(req, res, next){
    	Posts.findAll({where: {id:req.params.id}}).then(function(object){
            req.post=object;
            console.log(";;;;;");
            console.log(object);
            if (object.length != 0){
                var date = object[0].startingDate * 1000;
                req.message = "success"
                req.post[0].startingDate = moment(date).format('YYYY-MM-DD');
            }
            else{
                req.message = "failed"
                req.post = "deleted"
            }
            next();
    })},
    getAllPosts:function(req, res, next){
        Posts.findAll().then(function(object){
        var batch = req.params.batch;
        postArray = returnBatches(object);
        req.posts = postArray[batch];
        next();
        }) 
    },

  getAllPostID:function(req, res, next){
     Posts.findAll().then(function(object){
       var ids = [];
       var i = 0;
       while (object[i]){
           ids.push(object[i].id);
           i ++;
       }
       req.posts=ids;
       next();
   }) 
 },
 getUserName:function(req, res, next){
     var post = req.post;
     req.userName = post[0].userName;
     next();
 },
 uploadImage:function(req, res, next){

    var cache = [];
    console.log(JSON.stringify(req, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
        }
        // Store value in our collection
        cache.push(value);
    }
    return value;
}));
    fs.readFile(req.body, function (err, data) {
     console.log(JSON.stringify(data));
	// ...
	var newPath = __dirname + "./";
	fs.writeFile(newPath, data, function (err) {
       res.redirect("back");
   });
});
    next();
},
getImage: function(req, res, next){
	var ImageID = req.params.ImageID;
    res.sendFile(path.resolve(ImageID));
	//res.sendFile(__dirname + '/../'+ImageID);
},
updateByID:function(req, res, next){
	Posts.findOne({where: {PostID:req.params.PostID}}).then(function(object){
       if (object){
          object.updateAttributes({
            description: req.params.description,
            duration: req.params.duration,
            price: req.params.price,
            starting_date: req.params.starting_date,
            ending_date: req.params.ending_date,
            allow_joint_rent: req.params.allow_joint_rent,
            requirement: req.params.requirement
        });
          req.post=object;

      }
      next();
    }) 

},


getPostsByDistance: function(req, res, next){
    console.log("getPostsByDistance is called");
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var selectedCity = req.body.city;
    var batch = req.params.batch;

    var pricemin = req.body.pricemin;
    var pricemax = req.body.pricemax;
    var termmin = req.body.termmin;
    var termmax = req.body.termmax;

    var washroom = req.body.washroom;
    var den = req.body.den;
    var bedroom = req.body.bedroom;
    var parking = req.body.parking;
    var type = req.body.type;
    var startingDate = req.body.startingDate;
    console.log("startingDate")
    console.log(startingDate)
    var thePassedKey = JSON.stringify(req.body);
    //var key = "latitude:"+latitude+";longitude:"+longitude+";selectedCity:"+selectedCity+";pricemin:"+pricemin+";pricemax:"+pricemax+";termmin:"+termmin+";termmax:"+termmax+";washroom:"+washroom+";den:"+den+";bedroom:"+bedroom+";parking:"+parking+";type:"+type+";startingDate:"+startingDate;

    var time;

        // Other Settings
        var isCloseSubway = req.body.isCloseSubway
        var isFurnitureProvided = req.body.isFurnitureProvided
        var isJointAllowed = req.body.isJointAllowed
        var isPetAllowed = req.body.isPetAllowed
        var isSingleOnly = req.body.isSingleOnly
        var hasGym = req.body.hasGym
        var hasBath = req.body.hasBath
        var otherSettings = {isCloseSubway: isCloseSubway, isFurnitureProvided: isFurnitureProvided, 
          hasGym: hasGym, hasBath: hasBath,
          isSingleOnly: isSingleOnly, isPetAllowed: isPetAllowed,
          isJointAllowed: isJointAllowed}

          var ZERO = 0;
          var largeNumber = 100000000;
          var priceMin = ZERO;
          var termMin = ZERO;
          var bedroomMin = ZERO; 
          var washroomMin = ZERO;
          var denMin = ZERO;
          var parkingMin = ZERO;
          var priceMax = largeNumber;
          var termMax = largeNumber;
          var bedroomMax = largeNumber;
          var washroomMax = largeNumber;
          var denMax = largeNumber;
          var parkingMax = largeNumber;
          var type = ["Condo", "House", "Apartment"];

          if (req.body.pricemin && req.body.pricemin != ""){
            priceMin = Number(req.body.pricemin);
        }
        if (req.body.pricemax && req.body.pricemax != ""){
            priceMax = Number(req.body.pricemax);
        }
        if (req.body.termmin && req.body.termmin != ""){
            termMin = Number(req.body.termmin);
        }
        if (req.body.termmax && req.body.termmax != ""){
            termMax = Number(req.body.termmax);
        }
        if (req.body.type && req.body.type != ""){
            type = [req.body.type];
        }   
        if (req.body.bedroom && req.body.bedroom != ""){
            console.log("bedroom");
            console.log(req.body.bedroom);
            bedroomMin = Number(req.body.bedroom[0]);
        }
        if (req.body.washroom && req.body.washroom != ""){
            washroomMin = Number(req.body.washroom[0]);
        }
        if (req.body.den && req.body.den != ""){
            denMin = Number(req.body.den[0]);
        }
        if (req.body.parking && req.body.parking != ""){
            parkingMin = Number(req.body.parking[0]);
        }

        var postSearch = postSearchDAO.getSelf;

        postSearch.findAll({where: {conditions: thePassedKey}}).then(function(object){            
            // case 1: the key exists
            if (object.length != 0){
                console.log("conditions found");
                
                // return those batches
                var allPosts = object[0].posts;
                var parsedAllPosts = JSON.parse(allPosts);

                console.log("parsedAllPosts.length");
                console.log(parsedAllPosts.length);
                if (batch < parsedAllPosts.length){
                    req.posts = parsedAllPosts[batch];
                }
                else{
                    req.posts = [];
                }      
                
                next();
            }
            else{
                var filterMap = {
                    city: selectedCity, 
                    price:{$gte: priceMin, $lte: priceMax},
                    leaseTerm:{$gte: termMin, $lte: termMax},
                    type: type,
                    bedroomNumber:{$gte: bedroomMin},
                    washroomNumber:{$gte: washroomMin},
                    denNumber:{$gte: denMin},
                    parking:{$gte: parkingMin},
                }
                if (startingDate != ""){
                    startingDateMoment = moment(startingDate).unix()
                    console.log("startingDateMoment: " + startingDateMoment)
                    filterMap = {
                        city: selectedCity, 
                        price:{$gte: priceMin, $lte: priceMax},
                        leaseTerm:{$gte: termMin, $lte: termMax},
                        type: type,
                        bedroomNumber:{$gte: bedroomMin},
                        washroomNumber:{$gte: washroomMin},
                        denNumber:{$gte: denMin},
                        parking:{$gte: parkingMin},
                        startingDate:{$lte: startingDateMoment}
                    }
                }
                else{
                    console.log("startingDate is empty string")
                }



              for (var key in otherSettings) {
                  if (otherSettings[key] == "true") {
                    filterMap[key] = true
                }
            }

            console.log("filterMap: ");
            for (var key in filterMap){
                console.log("key: " + key + ", " + filterMap[key]);
            }
            
            Posts.findAll({where: filterMap}).then(function(object){
                var posts = [];
                var i = 0;
                checker = 0;
                postsWithinDistance = [];
                console.log("object.length: " + object.length);
                if (object.length > 0){
                    while (object[i]){
                        post = object[i];
                        posts.push({
                            id: post.id,
                            latitude: post.latitude,
                            longitude: post.longitude
                        });
                        i ++;
                    }

                    rankAllPostsByDistance(posts, req, latitude, longitude, posts.length, batch, thePassedKey, next);
                }
                else{
                    req.posts = [];                
                    next()
                }

            }) 
        }
    }) 
},
getBasicPostInfo: function(req, res, next){
    Posts.findOne({where: {id:req.params.PostID}}).then(function(object){
        console.log(object)
        if (object){
            req.post=[object["id"], object["address"], object["price"], object["bedroomNumber"], object["washroomNumber"], object["denNumber"], object["createdAt"], object["title"], object["images"], object["userId"]];
        }
        else{
            console.log("Object is null");
            req.post=[req.params.PostID, "", 0, 0, 0, 0, "1994-11-24", "已删除", ""];
        }
        next();
    })         
},
getBasicPostInfoDic: function(req, res, next){
    Posts.findOne({where: {id:req.params.PostID}}).then(function(object){
        console.log(object)
        if (object){
            req.post={"id":object["id"], "address":object["address"], "price":object["price"], "bedroomNumber":object["bedroomNumber"], "washroomNumber":object["washroomNumber"], "denNumber":object["denNumber"], "createdAt":object["createdAt"], "title":object["title"], "images":object["images"], "userId":object["userId"]};
        }
        else{
            console.log("Object is null");
            req.post={"id":req.params.PostID, "address":"", "price":0, "bedroomNumber":0, "washroomNumber":0, "denNumber":0, "createdAt":"1994-11-24", "title":"已删除", "images":[], "userId":""};
        }
        next();
    })         
},

removePost: function(req, res, next){
  console.log("The destroyed id: " + req.params.postId)
    Posts.destroy({
        where: {
            id:req.params.postId
        }
    }).then(function(object){
        console.log("destroy result: " + object)
        if (object){
            User.findOne({where: {id:req.params.userId}}).then(function(user){
                console.log("user: " + user);
                if (user){
                    console.log("In user")
                    console.log(parseInt(req.params.postId))
                    user.sentPosts.remove(parseInt(req.params.postId));
                    user.updateAttributes({
                        sentPosts: user.sentPosts
                    });
                }
                else{
                    console.log("User is not found")
                }
            })
            console.log("destroy successed")
            req.message = "success"
        }
        else{
            console.log("destroy failed")
            req.message = "failed"
        }
        next();
    })      
},

updatePost:function(req, res, next){

    var roomNumber = req.body.roomNumber.split(",");
    console.log("wwwwww")
    console.log(req.body.id)
    console.log(req.body)
    Posts.findOne({where: {id: req.body.id}}).then(function(selectedPost){
        console.log("before if");
        if (selectedPost){
            console.log("in the if");
            selectedPost.updateAttributes({
                title: req.body.title,
                userId: req.body.userId,
                city: req.body.city,
                price: req.body.price,
                postDescription: req.body.postDescription,
                type: req.body.type,
                bedroomNumber: roomNumber[0][roomNumber[0].length-1] == "+" ? 10 : roomNumber[0][0],
                livingroomNumber: roomNumber[1][roomNumber[1].length-1] == "+" ? 3 : roomNumber[1][0],
                washroomNumber: roomNumber[2][roomNumber[2].length-1] == "+" ? 5 : roomNumber[2][0],
                denNumber: roomNumber[3][roomNumber[3].length-1] == "+" ? 3 : roomNumber[3][0],
                parking: req.body.parking,
                size: req.body.size,
                leaseTerm: req.body.leaseTerm,
                address: req.body.address,
                unit: req.body.unit,
                startingDate: moment(req.body.startingDate).unix(),
                endDate: moment(req.body.endDate).unix(),
                occupation: req.body.occupation,
                hasGym: req.body.hasGym,
                hasBath: req.body.hasBath,
                isPetAllowed: req.body.isPetAllowed,
                isCloseSubway: req.body.isCloseSubway,
                isSingleOnly: req.body.isSingleOnly,
                isJointAllowed: req.body.isJointAllowed,
                isFurnitureProvided: req.body.isFurnitureProvided,
                gender: req.body.gender,
                postCode: req.body.postCode,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                images: req.body.images,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                otherContact: req.body.otherContact
            });
            console.log("set req.post");
            req.post = selectedPost;
            req.message = "success";
        }
        else{
            req.message = "failed";

        }
        console.log("before next");
        next();
    })
},


newPost:function(req, res, next){
    var roomNumber = req.body.roomNumber.split(",");
    console.log("create starting date")
    console.log(req.body.startingDate)
    Posts.create({
        title: req.body.title,
        userId: req.body.userId,
        city: req.body.city,
        price: req.body.price, 
        postDescription: req.body.postDescription,
        type: req.body.type,
        bedroomNumber: roomNumber[0][roomNumber[0].length-1] == "+" ? 10 : roomNumber[0][0],
        livingroomNumber: roomNumber[1][roomNumber[1].length-1] == "+" ? 3 : roomNumber[1][0],
        washroomNumber: roomNumber[2][roomNumber[2].length-1] == "+" ? 5 : roomNumber[2][0],
        denNumber: roomNumber[3][roomNumber[3].length-1] == "+" ? 3 : roomNumber[3][0],
        parking: req.body.parking,
        size: req.body.size,
        leaseTerm: req.body.leaseTerm,
        address: req.body.address,
        unit: req.body.unit,
        startingDate: moment(req.body.startingDate).unix(),
        endDate: moment(req.body.endDate).unix(),
        occupation: req.body.occupation,
        hasGym: req.body.hasGym,
        hasBath: req.body.hasBath,
        isPetAllowed: req.body.isPetAllowed,
        isCloseSubway: req.body.isCloseSubway,
        isSingleOnly: req.body.isSingleOnly,
        isJointAllowed: req.body.isJointAllowed,
        isFurnitureProvided: req.body.isFurnitureProvided,
        gender: req.body.gender,
        postCode: req.body.postCode,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        images: req.body.images,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        otherContact: req.body.otherContact
    })
.then(function(post){
  console.log("Post is created")
  User.findOne({where: {id: req.body.userId}}).then(function(object){
	console.log("Looking for Poster")
    if (object){
		console.log("Poster has been found")
		console.log(object)
        object.sentPosts.push(post.id)
        object.updateAttributes({
            sentPosts: object.sentPosts
        });
    }
});
    //delete records from PostSearches
    var postSearch = postSearchDAO.getSelf;
    postSearch.destroy({where: {}, truncate: true}).then(function (object) {
        console.log("postSearch records are destroyed after new records are created");
    });

    res.json({message : 'success', post: post.dataValues.id});

}).catch(function (error){
    console.log("FAILEDDDDDDDDDD");
    console.log(error);
    res.json(error);
});
}

};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
