document.getElementById('register').addEventListener('click', function() {
    // Retrieve input field values
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var firstname = document.getElementById('firstname').value;
    var lastname = document.getElementById('lastname').value;
    var age = document.getElementById('age').value;
    var gender = document.getElementById('gender').value;

    // Log the data
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("First Name:", firstname);
    console.log("Last Name:", lastname);
    console.log("Age:", age);
    console.log("Gender:", gender);

    var user_data = {
        "id" : 0,
        "username": username,
        "email": email,
        "password": password,
        "firstname": firstname,
        "lastname": lastname,
        "age": age,
        "gender": gender
    };

    var jsonUserData = JSON.stringify(user_data);
    console.log(jsonUserData);
});