var express  = require('express');
var router = express.Router();
var commentDao = require('../DAO/commentDAO.js');

// find post by PostID
router.get('/comment/:commentID', commentDao.getByID, function(req, res, next) {
    res.json({message : 'success', comment: req.comment});
    next();
});

// update post by PostID
router.get('/comment/update/:commentID/description=:description', commentDao.updateByID, function(req, res, next) {
    res.json({message : 'success', comment: req.comment});
    next();
});


module.exports = router;


//http://localhost:8002/comment/f27e3f90-940b-11e6-a7d5-19fd1edb06ad