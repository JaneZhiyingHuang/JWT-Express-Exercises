// Exercise 2

// Create a new express based server, create one endpoint GET /posts into it and use JWT security scheme in your route to protect it.

// The GET /posts should return an array of one line text messages such as “early bird catches the worm”.

// You will need to create another route for sign in which is used to create the JWT.

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key"; 

//exercise 2 endpoints
//POST /signin endpoint
app.post('/signin', (req, res) => {
    const user = { id: 1, username: "testuser" }; 
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

//JWT middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user; 
        next();
    });
}

//GET /posts endpoint
app.get('/posts', authenticateToken, (req, res) => {
    res.json(["early bird catches the worm"]);
});


app.listen(3000, () => console.log("Server running on port 3000"));

//testing if the endpoints can work with curl

//exercise 2

//curl -X POST http://localhost:3000/signin
//output: {"token":"(token generated)"}

//curl -X GET http://localhost:3000/posts -H "Authorization: Bearer (replaced with token just generated)"
//output: ["early bird catches the worm"]