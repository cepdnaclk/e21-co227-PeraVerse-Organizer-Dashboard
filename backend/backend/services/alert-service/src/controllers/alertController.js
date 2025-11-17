// controllers/orgController.js

const pool = require('../../../../db/db.js');

// POST route to create a new alert
const jwt = require('jsonwebtoken');
const { sendToKiosk } = require('../utils/kioskNotifier');

const createAlert = async (req, res) => {
  console.log("Incoming body:", req.body);

  const { alert, sent_at } = req.body;

  if (!alert) {
    return res.status(400).json({ error: "Alert message is required" });
  }

  // Extract token from header
  const authHeader = req.headers['authorization']; // "Bearer <token>"
  if (!authHeader) return res.status(400).json({ error: "Authorization header missing" });

  const token = authHeader.split(' ')[1]; // Get token part
  if (!token) return res.status(400).json({ error: "Token missing" });

  // Decode the token (without verifying)
  const decoded = jwt.decode(token);
  const sent_by = decoded?.username || "Unknown";

  try {
    const result = await pool.query(
      `INSERT INTO alerts (alert, sent_by, sent_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [alert.trim(), sent_by, sent_at || new Date()]
    );

    const savedAlert = result.rows[0];

    // Send alert to kiosk
    sendToKiosk(savedAlert);

    res.status(201).json({
      message: "Alert created successfully",
      data: savedAlert,
    });
  } catch (error) {
    console.error("Error inserting alert:", error);
    res.status(500).json({ error: "Database error while inserting alert" });
  }
};


  

// Get all alerts by ID
const getAlerts = async (req, res) => {
    
    try {
        const result = await pool.query('SELECT * FROM alerts');
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (err) {
        console.error('Error fetching alert by ID:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};


// Get an alert by ID
const getAlertById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM alerts WHERE alert_id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: 'Alerts not found' });
        }
    } catch (err) {
        console.error('Error fetching alerts:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

//delete alert

module.exports = {

    createAlert,
    getAlerts,
    getAlertById,
    //getOrganizers,
    //getOrganizerById,
    //updateOrganizer,
    //deleteOrganizer,
    
    //getNumberById,
    //updateNumber
};