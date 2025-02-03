Exercise 2

Create a new express based server, create one endpoint GET /posts into it and use JWT security scheme in your route to protect it.

The GET /posts should return an array of one line text messages such as “early bird catches the worm”.

You will need to create another route for sign in which is used to create the JWT.


Exercise 3: Role-Based Access Control (RBAC) with JWT

Enhance the basic JWT authentication by assigning two roles (e.g., admin, user).

The GET /posts should be available to both user groups.

Create a new endpoint POST /posts, which is used to add new one line text messages to the service. Only “admin” user should be allowed access.

Key Features:

· Users receive a role upon login.

· Middleware checks JWT and verifies if the user has the required role.



Exercise 4: Refresh Tokens & Token Expiry Handling


Improve security by implementing refresh tokens to extend session validity without requiring frequent logins. Refresh token is given along access token during sign in.


Key Features:

· Access tokens have a short expiration time (e.g., 15 minutes).

· A separate refresh token (longer lifespan) allows users to request a new access token.

· Logout functionality to invalidate refresh tokens.
