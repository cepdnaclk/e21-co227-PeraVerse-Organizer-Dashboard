// controllers/authController.js

const bcrypt = require('bcrypt'); // for password hashing - A secure password hashing algorithm based on Blowfish cipher
const jwt = require('jsonwebtoken'); // for JWT token creation
const pool = require('../../../../db/db.js'); //for database connection
const { sendApprovalEmail } = require('../utils/sendApproveEmail'); // email utility
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL; // admin email from .env file

// ======================
// REGISTER (Organizer)
// ======================
const register = async (req, res) => {
    try {
        const { fname, lname, email, contact_no, password } = req.body; // extract fields from the request body

        // make sure all required fields are there
        if (!fname || !lname || !email || !password) {
            return res.status(400).json({ message: "fname, lname, Email (username) and Password are required" });
        } 

        // check if this email is already registered
        
        const existingUser = await pool.query('SELECT * FROM Organizer WHERE email = $1', [email]);
        // pool.query() returns an object like this:
        // {
        //   command: 'SELECT',
        //   rowCount: 1,                     // number of matching rows
        //   oid: null,
        //   rows: [                          // array of matching records
        //     { organizer_id: 1, email: 'abc@example.com', fname: 'John', ... }
        //   ],
        //   fields: [ ... ]                  // metadata about columns
        // }

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email (username) already registered" });// if email exists, reject
        }

        // create full name from fname + lname
        const organizer_name = `${fname} ${lname}`;

        // hash the password before saving (never store plain text passwords)
        const saltRounds = 10 //controls how many times bcrypt rehashes the password internally
        const password_hash = await bcrypt.hash(password, saltRounds);

        // insert new organizer record with "pending" status until admin approves
        const result = await pool.query(
            `INSERT INTO Organizer (organizer_name, fname, lname, email, contact_no, password_hash, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING organizer_ID, organizer_name, fname, lname, email AS username, contact_no, status`,
            [organizer_name, fname, lname, email, contact_no || null, password_hash, 'pending']
        );

        // send an email to admin with approval link
        const approvalLink = `${process.env.BASE_URL}/auths/approve/${result.rows[0].organizer_id}`; // construct approval link

        await sendApprovalEmail(
            ADMIN_EMAIL, // the admin’s email address (loaded from .env file)
            { organizer_name, email }, // info about the new organizer used in the email body
            approvalLink // the approval link for admin to click
        );

        // respond back to the frontend
        res.status(201).json({ 
            message: "Registration request sent for admin approval.",
            organizer: result.rows[0]
        });

    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


// ======================
// LOGIN (Organizer)
// ======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // quick check for missing fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email (username) and Password are required" });
        }

        // try to find the user in the db
        const userResult = await pool.query('SELECT * FROM Organizer WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email (username) or password" });
        }

        const user = userResult.rows[0]; // Extracts the first (and only) row from the query result — the organizer’s record.

        // make sure the account is approved first
        if (user.status !== 'approved') {
            return res.status(403).json({ message: "Account not approved by admin yet." });
        }

        // compare passwords (hashed version)
        const isPasswordValid = await bcrypt.compare(password, user.password_hash); // compares plain text password with hashed password from db
        // rehashes the provided password and checks if it matches the stored hash
        // algorithm version → $2b$ indicates bcrypt version
        // salt rounds → 10

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email (username) or password" });
        }

        // create a JWT token so the frontend can keep the user logged in
        const token = jwt.sign(
            { id: user.organizer_id, username: user.email }, // The payload above is also be Base64-encoded in the token
            process.env.JWT_SECRET, // secret key from .env file
            { expiresIn: '6h' } // token valid for 1 hour
        );
        // this is the formate of the final token: (header.payload.signature)
        // header: { alg: "HS256", typ: "JWT" }
        // payload: { id: user.organizer_ID, username: user.email }
        // signature: HMAC-SHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret) 
        //  HMAC-SHA256 performs hashing not encryption


        // all good — send token
        res.json({ message: "Login successful", token });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = { register, login };