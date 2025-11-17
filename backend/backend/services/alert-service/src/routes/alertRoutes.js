const express  =require("express");
const router = express.Router(); // Creates a modular, mini Express app just for defining routes
//const verifyToken = require('./verifyToken');

// Import controller functions

const {
    createAlert,
    getAlertById,
    getAlerts,

} = require('../controllers/alertController');

//  Routs    //


//create an alert
router.post('/',createAlert);

//Get an alert by ID
router.get('/:id', getAlertById);

//Get all alerts
router.get('/',getAlerts);

//Delete a organizer
//router.delete('/:id',deleteOrganizer);

module.exports = router;