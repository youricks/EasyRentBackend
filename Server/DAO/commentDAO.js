var mysql = require('mysql');
var UserDAO = require('../DAO/userDAO.js');

const fs = require('fs');

// could be put in a file
var text = fs.readFileSync('databaseInfo.txt','utf8');
var databaseInfo = JSON.parse(text);
var user = databaseInfo.user;
var password = databaseInfo.password;
var router = databaseInfo.router;
var port = databaseInfo.port;
var database = databaseInfo.database;
sequelize_initial = 'postgres://' + user + ':' + password + '@' + router + ':' + port + '/' + database;

var Sequelize = require('sequelize');
var sequelize = new Sequelize(sequelize_initial);

var Comments = sequelize.define('Comments', {
 CommentID: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true
 },  
 description: {
 	type: Sequelize.STRING
 },
 userName: {
 	type: Sequelize.STRING
 	//allowNull: false
 },
 PostID: {
  type: Sequelize.UUID
 }
 
 // Not implemented: 
 // 1. Images: maybe saved as array of image ids
 // 2. Request: maybe saved as hashtag

}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

/*
Comments.sync({force: true}).then(function () {
  // Table created
  return Comments.create({
	description: "a new comment",
	userName: "youRuizhi",
  PostID: "16c82ca0-940a-11e6-ad51-0f0666df24e1"
  });
}); 
*/

module.exports = {
  getByID:function(req, res, next){
    Comments.findAll({where: {CommentID:req.params.commentID}}).then(function(object){
      console.log(object);
      req.comment=object;
      next();
    }) 
  },

  updateByID:function(req, res, next){
    Comments.findOne({where: {CommentID:req.params.commentID}}).then(function(object){
      if (object){
        object.updateAttributes({
          description: req.params.description
        });
        req.comment=object;

      }
      next();
    }) 

  }
};




