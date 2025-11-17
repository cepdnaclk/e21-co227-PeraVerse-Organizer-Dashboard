// verifyToken.js

const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // load env variables

// quick sanity check — make sure JWT_SECRET is loaded properly
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

const verifyToken = (req, res, next) => {
    // the token usually comes in the "Authorization" header as "Bearer <token>"
    const authHeader = req.headers['authorization']; // get the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // get the part after 'Bearer'

    // if there’s no token, reject the request right away
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const jwtSecret = process.env.JWT_SECRET;

    // helpful for debugging — checks whether the secret actually came from env
    console.log('Using JWT_SECRET from:', process.env.JWT_SECRET ? 'environment' : 'fallback');
    
    // verify the token using our secret key
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.status(403).json({ message: "Invalid token." });
        }

        // if token is valid, attach user info (decoded payload) to the request
        req.user = decoded;

        // move on to the next middleware or route handler
        next();
    });
};

module.exports = verifyToken;
