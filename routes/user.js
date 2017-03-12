var express  = require('express');
var router = express.Router();
var userDao = require('../DAO/userDAO.js');
var postDao = require('../DAO/postDAO.js');
console.log("caocaocao")
console.log(userDao)
// Verify user token
router.get('/user/verify/:token', userDao.verifyUserToken, function(req, res, next) {
    next();
});

//update the user by userName(ID)
router.get('/user/update/:userName/userNickname=:userNickname&email=:email&gender=:gender', userDao.updateByName, function(req, res, next) {
    res.json({message : res.created?"fail":'success', user: req.user});
    next();
});

//Like a post
router.get('/user/:userId/like/:postId', userDao.like, function(req, res, next) {
    res.json({message : 'success'});
    next();
});
//Like a post
router.get('/user/:userId/unlike/:postId', userDao.unlike, function(req, res, next) {
    res.json({message : 'success'});
    next();
});

//get all the user's info by userId
router.get('/user/userInfo/:userId', userDao.getUserById, function(req, res, next) {
    res.json({message : 'success', user: req.user});
    next();
});

//get the user's basic info by userId
router.get('/user/userBasicInfo/:userId', userDao.getUserBasicById, function(req, res, next) {
    res.json({message : 'success', user: req.user});
    next();
});

//get the user's contact info by userId
router.get('/user/userContactInfo/:userId', userDao.getUserContactById, function(req, res, next) {
    res.json({message : 'success', user: req.user});
    next();
});

// update user info
router.post('/user/userUpdate', userDao.userUpdate, function(req, res, next) {
    res.json({message : 'success', user: req.user});
    next();
});

router.post('/user/create', userDao.setUser, function(req, res, next) {
    res.json({message : 'success', user: req.user});
    next();
});

router.post('/user/login', userDao.userLogIn, function(req, res, next) {
    res.json({message : 'success', isFirstTime: req.isFirstTime, user: req.user});
    next();
});






module.exports = router;
