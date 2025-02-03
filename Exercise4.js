// Exercise 4: Refresh Tokens & Token Expiry Handling


// Improve security by implementing refresh tokens to extend session validity without requiring frequent logins. Refresh token is given along access token during sign in.


// Key Features:

// · Access tokens have a short expiration time (e.g., 15 minutes).

// · A separate refresh token (longer lifespan) allows users to request a new access token.

// · Logout functionality to invalidate refresh tokens.


//ideas for implementation:

//acess tokens: short expiration time, 15 minutes
//refresh tokens: long expiration time, 1 day or more?

//get refresh tokens-->
// store refresh tokens-->
// check if refresh token is valid,use refresh tokens to get the short time access token-->
// generate new access token-->
// logout functionality to invalidate refresh tokens


const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key"; 
const REFRESH_SECRET_KEY = "your_refresh_secret_key";

//test data
const users = [
    { id: 1, username: "testuser", password: "password123", role: "admin" }
];

//Funtion to generate access token
function generateAccessToken(user) {
    const { id, username } = user;  
    return jwt.sign({ id, username }, SECRET_KEY, { expiresIn: '15m' });
}
//Function to generate refresh token
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, REFRESH_SECRET_KEY, { expiresIn: '1d' });
    refreshTokens[refreshToken] = user;  // Store the refresh token
    return refreshToken;
}

// Store refresh tokens
const refreshTokens = {};

//POST /signin endpoint
app.post('/signin', (req, res) => {
    const { username, password } = req.body; 

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "User is not found" });
    }
    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    //generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.json({ accessToken, refreshToken });//return both access and refresh tokens
});

//JWT middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user; 
        next();
    });
}

//Middleware to check if the user has the required role
function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
        }
        next();
    };
}

//GET /posts endpoint
app.get('/posts', authenticateToken, (req, res) => {
    res.json(["early bird catches the worm"]);
});

//POST /posts endpoint
app.post('/posts', authenticateToken, checkRole('admin'), (req, res) => {
    res.json({ message: "New post added successfully!" });
});

//exercise 4 endpoints
//POST /refresh endpoint
app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken || !refreshTokens[refreshToken]) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        // Generate a new access token
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    });
});

//POST /logout endpoint
app.post('/logout', (req, res) => {
    const refreshToken = req.body.refreshToken;
    delete refreshTokens[refreshToken];  // Remove the refresh token from the store
    res.json({ message: "Logged out successfully" });
});


app.listen(3000, () => console.log("Server running on port 3000"));

//testing if the endpoints can work with curl
//exercise 4

//curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d '{"username": "testuser", "password": "password123"}'
//output: {
//   "accessToken": "your_access_token",
//   "refreshToken": "your_refresh_token"
// }

//curl -X POST http://localhost:3000/refresh -d '{"refreshToken": "your_refresh_token"}' -H "Content-Type: application/json"
//output:{ "accessToken": "new_access_token"}

//curl -X POST http://localhost:3000/logout -d '{"refreshToken": "your_refresh_token"}' -H "Content-Type: application/json"
//output: { "message": "Logged out successfully" }