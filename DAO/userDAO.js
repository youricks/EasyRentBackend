var mysql = require('mysql');
var pg = require('pg');
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

var User = sequelize.define('Users', {

    id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // not necessary
    userNickname: {
        type: Sequelize.STRING
        /*
        validate: {
        is: ["^[a-zA-Z0-9!@#$%^&*]+$",'i'],
        len: [1,30]
        },
        */
    },
    avatar: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    phoneNumber: {
        type: Sequelize.STRING
    },
    gender: {
        type: Sequelize.STRING
    },
    selfDescription: {
        type: Sequelize.STRING
    },
    occupation: {
        type: Sequelize.STRING
    },
    school: {
        type: Sequelize.STRING
    },
    company: {
        type: Sequelize.STRING
    },
    job: {
        type: Sequelize.STRING
    },
    city: {
        type: Sequelize.STRING
    },
    otherContactInfo: {
        type: Sequelize.STRING
    },
    sentPosts: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
    },
    favouritePosts:{
        type: Sequelize.ARRAY(Sequelize.INTEGER)
    }

}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

module.exports = {
  getSelf: User,
  chongFunction: function(sequelize, DataTypes) {
    return User;
  },
  setUser:function(req,res,next){
    var user = {
      userName: req.query.userName,
      password: req.query.password,
      userNickname: req.query.userNickname,
      email: req.query.email,
      comments: req.query.comments,
      gender: req.query.gender,
    };
    User.findOrCreate({where: user})
    .spread(function(user,created){
      req.user = user;
      req.created = created;
      next();  
    })
  },
  like:function(req,res,next){
    User.findOne({where: {id:req.params.userId}}).then(function(object){
      if (object){
        if (!object.favouritePosts.includes(parseInt(req.params.postId))){
            object.favouritePosts.push(req.params.postId)
            object.updateAttributes({
                favouritePosts: object.favouritePosts
            });
        }
        req.user=object;
      }
      next();
    }) 
  },
  unlike:function(req,res,next){
    User.findOne({where: {id:req.params.userId}}).then(function(object){
      if (object){
        if (object.favouritePosts.includes(parseInt(req.params.postId))){
            object.favouritePosts.remove(parseInt(req.params.postId))
            object.updateAttributes({
                favouritePosts: object.favouritePosts
            });
        }
        req.user=object;
      }
      next();
    }) 
  },
  verifyUserToken: function(req, res, next){
    console.log("entered")
    var https = require('https');
    console.log("https required")
    //var sampleInput = 'EAAZAININjbQkBAPMy9SvnXZClADREkb9i3baeQw1qvq02RzIICkIawUZBb8sDOnsgZCZCGRdv3Td8nQFBvK1bnwqhWkfrCblC7jfqjoKecRXTh9UNsJHTlTHEjepjOk2WZC0VdGwfjzWGtOVFuC8r4sa0AgEQli2k1ISU6IZASoBMjTpfW1Y9ZBxIAEeXEXVbhFBW4kdZCBdtZAHDzNUMSy34SfhRZAPHZBWNZC9RFZA5dyKeu8wZDZD'
    var accessToken = '1768240240094473|' + applicationPassword;
    var inputToken = req.params.token;
    var url = `https:\/\/graph.facebook.com/debug_token?input_token=${inputToken}&access_token=${accessToken}`
    https.get(url, (response) => {
      console.log('statusCode:', response.statusCode);
      console.log('headers:', response.headers);
      response.setEncoding('utf8');
      response.on('data', (d) => {
        res.json(d);
        next();
      });
    }).on('error', (e) => {
      console.error(e);
    });
  },
    userLogIn: function(req, res, next){
        var sentId = req.body.sentId;
        var appType = req.body.appType;
        var combinedId = appType + sentId;
        User.findOne({where: {id: combinedId}}).then(function(object){
            if (object){
                var reqeustUser=object["dataValues"];
                req.user = reqeustUser;
                req.isFirstTime = false;
                console.log(reqeustUser);
                next();
            }
            else{
                console.log("no user found");
                //res.json({message : 'success', sent: "yes"});

                User.create({
                    id: combinedId,
                    userName: req.body.userName,
                    avatar: req.body.avatar,
                    favouritePosts: [],
                    sentPosts: []
                })
                .then(function(newUser){
                    console.log("SUCCESSsSSSSS");
                    var reqeustUser=newUser["dataValues"];
                    console.log(reqeustUser);
                    req.isFirstTime = true;
                    req.user=reqeustUser;

                    next();

                }).catch(function (error){
                    console.log("FAILEDDDDDDDDDD");
                    req.user = error
                    console.log(error)
                });
            }
        }) 
    },

    getUserById: function(req, res, next){
        var userId = req.params.userId;
        User.findOne({where: {id: userId}}).then(function(object){
            if (object){
                req.user = object;
            }
            else{
                console.log("no user found");
                req.user = "no user found"
            }
            next();
        })
    },

 
    getUserContactById: function(req, res, next){
        var userId = req.params.userId;
        User.findOne({where: {id: userId}}).then(function(object){
            if (object){
                req.user = {userId: object.id, email: object.email, phoneNumber: object.phoneNumber, otherContactInfo: object.otherContactInfo};
            }
            else{
                console.log("no user found");
                req.user = "no user found"
            }
            next();
        })
    },

    getUserBasicById: function(req, res, next){
        var userId = req.params.userId;
        User.findOne({where: {id: userId}}).then(function(object){
            if (object){
                req.user = {userId: object.id, userName: object.userName, avatar: object.avatar};
            }
            else{
                console.log("no user found");
                req.user = "no user found"
            }
            next();
        })
    },

    userUpdate: function(req, res, next){
        console.log("call");
        var id = req.body.id;
        console.log(req.body);
        console.log("id: " + id);
        
        User.findOne({where: {id: req.body.id}}).then(function(selectedUser){
            console.log("before if");
            if (selectedUser){
                console.log("in the if");
                selectedUser.updateAttributes({
                    // avatar needs to be updated
                    avatar: req.body.avatar,
                    selfDescription: req.body.selfDescription,
                    userName: req.body.userName,
                    city: req.body.city,
                    gender: req.body.gender,
                    occupation: req.body.occupation,
                    userNickname: req.body.userNickname,
                    school: req.body.school,
                    company: req.body.company,
                    job: req.body.job,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    otherConteactInfo: req.body.otherConteactInfo
                });
                console.log("set req.user");
                req.user = selectedUser;
            }
            console.log("before next");
            next();
        })
        
 
    

    },    

  updateByName:function(req, res, next){
    User.findOne({where: {userName:req.params.userName}}).then(function(object){
      if (object){
        object.updateAttributes({
          userNickname: req.params.userNickname,
          email: req.params.email,
          gender: req.params.gender
        });
        req.user=object;

      }
      next();
    }) 
  },
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

