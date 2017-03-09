var user0 = {Name:"Justin__", wechatID:"1", password:"1234567a", schoolID:""};

function createUserValidate(user){

	// User information
	name = user.Name;
	ID = user.wechatID;
	password = user.password; // password maybe not necessary for facebook or wechat login
	


	// User regular expression
	var nameReg = /^[\w_]{1,25}$/; // name cannot be same as others, need to be linked into database 
	var IDReg = /^[0-9]+$/;
    var passwordReg  = /^[a-zA-Z0-9!@#$%^&*]{8,16}$/;

    // Validation
	var nameValid = name.match(nameReg);
	var IDValid = ID.match(IDReg);
	var passwordValid = password.match(passwordReg);

	
	if (nameValid == null){
		console.log("The username is invalid");
		return;
	}
	if (IDValid == null){
		console.log("The ID is invalid");
		return;
	}
	if (passwordValid == null){
		console.log("The password is invalid");
		return;
	}

}


createUserValidate(user0);

 