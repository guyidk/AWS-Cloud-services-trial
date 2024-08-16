// This function handles the user registration process.
function register() {
    var jsonData = new Object();
    jsonData.username = document.getElementById("username").value;
    jsonData.email = document.getElementById("email").value;
    jsonData.password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var profileImage = document.getElementById("profileImage").files[0];

    // Validate the username length
    if (jsonData.username.length > 25) {
        alert('Username cannot be more than 25 characters!');
        return;
    }

    // Validate the email length
    if (jsonData.email.length > 260) {
        alert('Email cannot be more than 260 characters!');
        return;
    }

    // Check if the password and confirm password match
    if (jsonData.password != confirmPassword) {
        alert('Password and confirm password must be the same!');
        return;
    }

    // If a profile image is provided, read it as a data URL and then send the registration request
    if (profileImage) {
        var reader = new FileReader();
        reader.onloadend = function() {
            jsonData.profileImage = reader.result;
            sendRegisterRequest(jsonData);
        };
        reader.readAsDataURL(profileImage);
    } else {
        // If no profile image is provided, directly send the registration request
        sendRegisterRequest(jsonData);
    }
}

// This function sends a registration request to the server with the user data.
function sendRegisterRequest(jsonData) {
    var request = new XMLHttpRequest();
    request.open("POST", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/register", true);

    request.onload = function() {
        var response = JSON.parse(request.responseText);
        if (response.message == "User registered successfully") {
            alert('User registered successfully');
            window.location.href = "login.html";
        } else {
            alert(response.message);
        }
    };

    // Send the user data as a JSON string
    request.send(JSON.stringify(jsonData));
}

// This function handles the user login process.
function user_login() {
    var jsonData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    // Check if both email and password are provided
    if (jsonData.email === "" || jsonData.password === "") {
        alert('All fields are required!');
        return;
    }

    var request = new XMLHttpRequest();
    request.open("POST", "https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/user-login", true);

    request.onload = function() {
        var response = JSON.parse(request.responseText);
        console.log(response.message);
        if (response.message == "Login successful") {
            sessionStorage.setItem("token", response.token);
            sessionStorage.setItem("userId", response.userId);
            alert('Login successful');
            window.location.href = "index.html";
        } else if (response.message == "Invalid email or password") {
            alert('Invalid email or password');
        } else {
            alert(response.message);
        }
    };

    // Send the user data as a JSON string
    request.send(JSON.stringify(jsonData));
}

// This function retrieves user details from the server and displays them on the page.
function getUserDetails() {
    var userId = sessionStorage.getItem("userId");

    // Check if userId is stored in the session storage
    if (!userId) {
        console.error('User ID not found in session storage');
        return;
    }

    var request = new XMLHttpRequest();
    request.open("GET", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/user/${userId}`, true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var user = JSON.parse(request.responseText);

            // Get the current timestamp and append it to the profile image URL to prevent caching issues
            const timestamp = new Date().getTime(); // Get current timestamp
            const imageUrlWithTimestamp = `${user.profileImageUrl}?${timestamp}`; // Append timestamp to URL

            // Check if the user has a profile image URL and username, update the profile image and username on the page
            if (user.profileImageUrl) {
                document.getElementById("profileImage").src = imageUrlWithTimestamp;
            }
            if (user.username) {
                document.getElementById("username").textContent = user.username;
            }
        } else {
            console.error('Failed to retrieve user details:', request.statusText);
        }
    };

    // Define what happens if the request fails
    request.onerror = function() {
        console.error('Request failed');
    };

    request.send();
}

// This function handles the deletion of a user account.
function deleteUser() {
    var userId = sessionStorage.getItem("userId");

    // Confirm the user's intention to delete the account
    if (confirm('Are you sure you want to delete your account?')) {
        var request = new XMLHttpRequest();
        request.open("DELETE", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/user/${userId}`, true);

         // Define what happens when the server responds to the delete request
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("token");
                alert('User account deleted successfully');
                window.location.href = "index.html";
            } else {
                alert('Error. Unable to delete the account.');
            }
        };

        // Define what happens if the request fails
        request.onerror = function() {
            alert('Request failed. Please try again.');
        };

        request.send();
    }
}

// This function retrieves user details for editing and displays them in the form.
function getUserDetailsForEdit() {
    var userId = sessionStorage.getItem("userId");

    var request = new XMLHttpRequest();
    request.open("GET", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/user/${userId}`, true);

    // Define what happens when the server responds to the request for user details
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var user = JSON.parse(request.responseText);

            // Get the current timestamp and append it to the profile image URL to prevent caching issues
            const timestamp = new Date().getTime(); // Get current timestamp
            const imageUrlWithTimestamp = `${user.profileImageUrl}?${timestamp}`; // Append timestamp to URL

            // Update the profile image, username, and email in the form
            document.getElementById("profileImage").src = imageUrlWithTimestamp;
            document.getElementById("username").value = user.username;
            document.getElementById("email").value = user.email;
        } else {
            console.error('Failed to retrieve user details:', request.statusText);
        }
    };

    // Define what happens if the request fails
    request.onerror = function() {
        console.error('Request failed');
    };

    request.send();
}

// This function handles the updating of user details.
function updateUserDetails() {
    var jsonData = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value
    };

    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var profileImage = document.getElementById("profileImageUpload").files[0];

    // Validate the required fields
    if (jsonData.username === "" || jsonData.email === "") {
        alert('Username and email are required!');
        return;
    }

    // Validate the username length
    if (jsonData.username.length > 25) {
        alert('Username cannot be more than 25 characters!');
        return;
    }

    // Validate the email length
    if (jsonData.email.length > 260) {
        alert('Email cannot be more than 260 characters!');
        return;
    }
    
    // Check if password and confirm password match if a password is provided
    if (password !== "") {
        if (password !== confirmPassword) {
            alert('Password and confirm password must be the same!');
            return;
        }
        jsonData.password = password;
    }

    // If a profile image is provided, read it as a data URL and then send the update request
    if (profileImage) {
        var reader = new FileReader();
        reader.onloadend = function() {
            jsonData.profileImage = reader.result;
            sendUpdateUserRequest(jsonData);
        };
        reader.readAsDataURL(profileImage);
    } else {
        // If no profile image is provided, directly send the update request
        sendUpdateUserRequest(jsonData);
    }
}

// This function sends an update request to the server with the updated user data.
function sendUpdateUserRequest(jsonData) {
    var userId = sessionStorage.getItem("userId");
    var token = sessionStorage.getItem("token");

    // Check if the user is authenticated
    if (!userId || !token) {
        alert("User not authenticated. Please log in.");
        window.location.href = "login.html";
        return;
    }

    jsonData.userId = userId; // Add userId to the data being sent

    var request = new XMLHttpRequest();
    request.open("PUT", `https://h1mvvjvdd4.execute-api.us-east-1.amazonaws.com/user/${userId}`, true);

    // Define what happens when the server responds to the update request
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            alert('Profile updated successfully');
            window.location.href = 'user.html';
        } else {
            alert('Unable to update the profile.');
        }
    };

    request.onerror = function() {
        alert('Request failed. Please try again.');
    };

    request.send(JSON.stringify(jsonData));
}

// This function updates the login/logout button based on the user's authentication status.
function updateLoginLogoutButton() {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    const loginLogoutButton = document.getElementById('loginLogoutButton');

    // Check if the user is authenticated, if authenticated show the logout button else show login
    if (userId && token) {
        loginLogoutButton.innerText = "Logout";
        loginLogoutButton.onclick = logout;
    } else {
        loginLogoutButton.innerText = "Login";
        loginLogoutButton.href = "login.html";
    }
}

//handels the logout of the uer by clearing the session storage and redirecting them to the home page
function logout() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    window.location.href = "index.html";
}
