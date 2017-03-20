var express  = require('express');
var router = express.Router();
var postDao = require('../DAO/postDAO.js');
var userDao = require('../DAO/userDAO.js');

// find all post ids, return together temporarily
router.get('/post/postids', postDao.getAllPostID, function(req, res, next) {
    res.json({message : 'success', post: req.posts});
    next();
});

// remove post
router.get('/post/:postId/remove/from/:userId', userDao.verifyUserToken, postDao.removePost, function(req, res, next) {
    res.json({message : req.message, post: req.posts});
});
/*
// find all posts, return batch after batch
router.get('/post/posts/:batch', postDao.getAllPosts, function(req, res, next) {
    res.json({message : 'success', post: req.posts});
    next();
});
*/

// find post by PostID
router.get('/post/:id', postDao.getByID, function(req, res, next) {
    res.json({message : 'success', post: req.post});
    next();
});

// find basic info of post by PostID
router.get('/basicinfo/post/:PostID', postDao.getBasicPostInfo, function(req, res, next) {
    res.json({message : 'success', post: req.post});
    next();
});

// update post by PostID
router.get('/post/update/:PostID/description=:description&duration=:duration&price=:price&starting_date=:starting_date&ending_date=:ending_date&allow_joint_rent=:allow_joint_rent&requirement=:requirement', postDao.updateByID, function(req, res, next) {
    res.json({message : 'success', post: req.post});
    next();
});

// upload image for post
router.post('/post/update/:PostID/', postDao.uploadImage, function(req, res, next){
	console.log("Image Upload.....");
	next();
});
// get image
router.get('/post/image/:ImageID/', postDao.getImage, function(req, res, next){
	console.log("Image Donwload.....");
	next();
});
router.post('/post/new/', userDao.verifyUserToken, postDao.newPost, function(req, res, next){
    console.log("Post Create.....");
    next();
});

router.post('/posts/:batch', postDao.getPostsByDistance, function(req, res, next){
    console.log("distance retrieved");
    res.json({message : 'success', posts: req.posts});

    next();
});

module.exports = router;


//http://localhost:8002/post/update/16c82ca0-940a-11e6-ad51-0f0666df24e1/description=new_updated&duration=12&price=1123&starting_date=2016-10-10&ending_date=2017-10-10&allow_joint_rent=0&requirement='{single:1}'
