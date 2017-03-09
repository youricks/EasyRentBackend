
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1221',
  database : 'App'
});

exports.connection = function (){
return connection;
}

//select all posts belongs to a school ** UofT 
exports.selectPosts = function (schoolName, courseNumber){
	var schoolID = select_schoolID_by_schoolName(schoolName);
	console.log('The solution is', schoolID);

	/*
	connection.query('SELECT * from User where schoolid=1', function(err, rows, fields) {
	  if (!err)
	    console.log('The solution is: ', rows);
	  else
	    console.log('Error while performing Query.');
	})
	*/
}

function select_schoolID_by_schoolName(schoolName){
	console.log(schoolName);
	var input = 'SELECT schoolID from school where schoolName = "' + schoolName + '"';
	console.log(input);
	connection.query(input, function(err, rows, fields) {
	  if (!err){
	  	console.log('The solution length is:', rows);
		
		var res = rows[0].schoolID.toString();
	    console.log('The solution in select_schoolID_by_schoolName is:', res);
	    return "2";
	    

	  }
	  else{
	    console.log('Error while performing Query.');
		var res = "NotFound";
	  }

	  return res;
	})
}

exports.selectPosts2 = function (schoolName, courseNumber){

	// select schoolID
	var selectSchoolID = 'SELECT schoolID from school where schoolName = "' + schoolName + '"';
	console.log(selectSchoolID);
	var schoolID;
	connection.query(selectSchoolID, function(err, rows, fields，callback) {
	  if (!err){
		schoolID = rows[0].schoolID;
	  }
	  else{
	    console.log('Error while performing Query to select schoolID.');
		schoolID = "NotFound";
		console.log(schoolName + " is not found");
		callback();
		return;
	  }
	  callback();
	  


	})

	var PostSelector = 'SELECT * from Post where schoolID=' + schoolID;
	console.log(PostSelector);

	/*

	//var PostSelector = 'SELECT * from Post where schoolID = 1 AND CourseNumber=CSC108';
	var PostSelector = 'SELECT * from Post where schoolID = 1 AND CourseNumber="CSC108"';
	connection.query(PostSelector, function(err, rows, fields) {
	  if (!err){
		console.log('The selected posts:', rows);
	  }
	  else{
	    console.log('Error while performing Query to select posts.');
	  }


	})

	return "yes";
	*/





	// select post by courseNumber by schoolID


}


function callback(schoolID){
	console.log('The schoolID is:', schoolID);	  	

}

