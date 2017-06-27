var mysql = require('mysql');
var pg = require('pg');
const fs = require('fs');
var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
var applicationPassword = process.env.APP_PASSWORD

/**
    Initialize Firebase App
**/
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://easyrent-dfe31.firebaseio.com"
});

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
    avatarId:{
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
    console.log("user id is" + req.params.userId);
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
    userPostUpdate:function(req, res, next){
        console.log("calling userPostUpdate")
        console.log(req.body.id)
        User.findOne({where: {id:req.body.id}}).then(function(object){
                        console.log("object")

            console.log(object)
            if (object){
                object.updateAttributes({
                    sentPosts: req.body.sentPosts
                });
                req.user = object;
            }
            next()
        }) 
    },
  verifyUserToken: function(req, res, next){
    console.log("Going to print token...")
    console.log(req.query.token)
	admin.auth().verifyIdToken(req.query.token)
  		.then(function(decodedToken) {
        // Token verification success
    	var uid = decodedToken.uid;
		console.log(uid);
		console.log("IDENTITY VERIFIED")
        next();
  	}).catch(function(error) {
    	// Handle error, which usually means verification failed
        console.log(error)
		console.log("HACKER??")
        res.status(403).send("Authentication Failed, please log in again");
        return;
  	});
  },
    userLogIn: function(req, res, next){
        var combinedId = req.body.id;
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
                if (req.body.userNickname == null){
                    console.log("userNickname is null")
                }
                else{
                    console.log("userNickname is not null")                    
                }
                User.create({
                    id: combinedId,
                    userName: req.body.userName,
                    avatar: req.body.avatar,
                    avatarId: req.body.avatarId,
                    userNickname: req.body.userNickname,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    selfDescription: req.body.selfDescription,
                    occupation: req.body.occupation,
                    school: req.body.school,
                    company: req.body.company,
                    job: req.body.job,
                    city: req.body.city,
                    gender: req.body.gender,
                    otherContactInfo: req.body.otherContactInfo,
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
                    otherContactInfo: req.body.otherContactInfo
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

