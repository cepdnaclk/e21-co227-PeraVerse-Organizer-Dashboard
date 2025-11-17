// controllers/orgController.js

const pool = require('../../../../db/db.js');
const bcrypt = require('bcrypt');

// Get all organizers
const getOrganizers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Organizer WHERE status = $1 ORDER BY organizer_ID', ['approved']);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching Organizers:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Get a single organizer by ID
const getOrganizerById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Organizer WHERE organizer_ID = $1 AND status = $2', [id, 'approved']);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Organizer not found' });
        }
    } catch (err) {
        console.error('Error fetching Organizer by ID:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};


// Update an organizer (only allow self-update)
const updateOrganizer = async (req, res) => {
    const { id } = req.params;
    const { organizer_name, Fname, Lname, email, contact_no, password } = req.body;

    // Check if the organizer is trying to update their own profile
    
    if (parseInt(id) !== parseInt(req.user.id)) {
        return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    let hashedPassword = undefined;
    if (password) {
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (err) {
            console.error('Error hashing password:', err.message);
            return res.status(500).json({ message: 'Error hashing password', error: err.message });
        }
    }

    try {
        const result = await pool.query(
            `UPDATE Organizer
                SET organizer_name = COALESCE($1, organizer_name),
                Fname          = COALESCE($2, Fname),
                Lname          = COALESCE($3, Lname),
                email          = COALESCE($4, email),
                contact_no     = COALESCE($5, contact_no),
                password_hash  = COALESCE($6, password_hash),
                edited_at      = NOW()
                WHERE organizer_ID = $7
                RETURNING *`,
            [organizer_name, Fname, Lname, email, contact_no, hashedPassword, id]
        );
        if (result.rows.length > 0) {
            res.json({ message: 'Organizer updated', organizer: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Organizer not found' });
        }
    } catch (err) {
        console.error('Error updating Organizer:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

// Delete an organizer (only allow self-deletion)
const deleteOrganizer = async (req, res) => {
    const { id } = req.params;
    //const { organizer_name, Fname, Lname, email, contact_no, password, current_organizer_id } = req.body;


    // Check if the organizer is trying to delete their own profile
    
    if (parseInt(id) !== parseInt(req.user.id)) {
        return res.status(403).json({ message: "Forbidden: You can not delete others' profiles" });
    }

    try {
        const result = await pool.query('DELETE FROM Organizer WHERE organizer_ID = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Organizer deleted', organizer: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Organizer not found' });
        }
    } catch (err) {
        console.error('Error deleting Organizer:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};





// Get a number by ID
const getNumberById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT num FROM number WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Number not found' });
        }
    } catch (err) {
        console.error('Error fetching Number by ID:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

//update number by ID

const updateNumber = async (req, res) => {
    const { id } = req.params;
    const {number} = req.body;
    try {
        const result = await pool.query('UPDATE number SET num = $1 WHERE id = $2 RETURNING *', [number, id]);
        if (result.rows.length > 0) {
            res.json({message: "number saved", number: result.rows[0]});
        } else {
            res.status(404).json({ message: 'Number not found' });
        }
    } catch (err) {
        console.error('Error saving number:', err.message);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
};

module.exports = {
    getOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer, 
    getNumberById,
    updateNumber
};