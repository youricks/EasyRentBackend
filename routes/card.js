var express  = require('express');
var router = express.Router();
var cardDAO = require('../DAO/cardDAO.js');

router.post('/ticket/purchase',
	function(req, res, next) {
    	res.header("Access-Control-Allow-Origin", "*");
    	next()
	}, 
	cardDAO.purchase, 
	function(req, res, next) {
    	res.json({message : "Purchase Success"});
});

router.get('/ticket/verify/:id',
	cardDAO.verify, 
	function(req, res, next) {
    	res.json({message : "Purchase Success"});
});

router.get('/ticket/vipverify/:id',
    cardDAO.vipVerify, 
    function(req, res, next) {
        res.json({message : "Purchase Success"});
});

router.post('/code/verify',
    cardDAO.codeVerify,
    function(req, res, next) {
    res.json({isVerified: req.isVerified, isValid: req.isValid});
});

router.get('/ticket/price', function(req, res, next) {
	res.end("69");
});

module.exports = router;
