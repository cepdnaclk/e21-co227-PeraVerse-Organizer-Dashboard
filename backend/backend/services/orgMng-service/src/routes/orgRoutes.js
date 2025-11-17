const express  =require("express");
const router = express.Router(); // Creates a modular, mini Express app just for defining routes
const verifyToken = require('../../../../api-gateway/src/middlewares/verifyToken'); //import verifyToken


// Import controller functions

const {
    getOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer,
    getNumberById,
    updateNumber

} = require('../controllers/orgController');

//  Routs    //

//Get all organizers
router.get('/',getOrganizers);

//Get a single organizer by Id
router.get('/:id',getOrganizerById);

// Apply verifyToken to protected routes
router.put('/:id', verifyToken, updateOrganizer);
router.delete('/:id', verifyToken, deleteOrganizer);

//Get number by ID
router.get('/number/:id', getNumberById);

//PUT number by ID
router.put('/number/:id', updateNumber);

module.exports = router;