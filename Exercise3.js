// Exercise 3: Role-Based Access Control (RBAC) with JWT

// Enhance the basic JWT authentication by assigning two roles (e.g., admin, user).

// The GET /posts should be available to both user groups.

// Create a new endpoint POST /posts, which is used to add new one line text messages to the service. Only “admin” user should be allowed access.

// Key Features:

// · Users receive a role upon login.

// · Middleware checks JWT and verifies if the user has the required role.


const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key"; 

//test data
const users = [
    { id: 1, username: "testuser", password: "password123", role: "admin" }//change role to 'user' to test if the user can access the /posts endpoint 
];

//exercise 2 endpoints
//POST /signin endpoint
app.post('/signin', (req, res) => {
    const { username, password } = req.body; 

    //check if user exists
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "User is not found" });
    }
    // check if password is correct
    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    //generate token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
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
//exercise 3 middleware
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

//exercise 3 endpoint
//POST /posts endpoint
app.post('/posts', authenticateToken, checkRole('admin'), (req, res) => {
    res.json({ message: "New post added successfully!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));

//testing if the endpoints can work with curl
//exercise 3

//curl -X POST http://localhost:3000/signin -H "Content-Type: application/json" -d '{"username": "testuser", "password": "password123"}'
//output: {"token":"(token generated)"}

//curl -X POST http://localhost:3000/posts -H "Authorization: Bearer (replaced with token just generated)"
//output: {"message":You do not have access to this resource"} if user
//output: {"message":New post added successfully!}  if admin