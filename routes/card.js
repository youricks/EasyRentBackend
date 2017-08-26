var express  = require('express');
var router = express.Router();
var cardDAO = require('../DAO/cardDAO.js');
var TAX = 1.13

router.post('/ticket/purchase',
    cardDAO.codeVerify,
	function(req, res, next) {
        // Executed iff code has been given
        if (req.body.isValid){
            req.body.amount = Math.ceil(req.body.amount * 100 * 69 * TAX);
        } 
        else {
            req.body.amount = Math.ceil(req.body.amount * 100 * 79 * TAX);
        }
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
