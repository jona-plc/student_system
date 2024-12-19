require('dotenv').config(); 
console.log('Session Secret:', process.env.SESSION_SECRET); 

const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1800000,  
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}));

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database.");
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Student Login 
app.post('/student-login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM students WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'An error occurred while querying the database.' });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        const student = result[0];
        if (bcrypt.compareSync(password, student.password)) {
            req.session.user = { 
                id: student.id, 
                username: student.username, 
                role: student.role  
            };
            return res.json({ success: true, message: 'Login successful' });
        } else {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Student Registration 
app.post('/student-signup', (req, res) => {
    const { full_name, email, username, password } = req.body;

    if (!full_name || !email || !username || !password) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    const checkEmailQuery = 'SELECT * FROM students WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error("Error while checking email:", err);
            return res.json({ success: false, message: 'An error occurred while checking the email.' });
        }

        if (result.length > 0) {
            return res.json({ success: false, message: 'Email is already registered. Please use a different one.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const insertQuery = 'INSERT INTO students (full_name, email, username, password) VALUES (?, ?, ?, ?)';
        
        db.query(insertQuery, [full_name, email, username, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error while inserting student data:", err);
                return res.json({ success: false, message: 'An error occurred while registering the student.' });
            }
            return res.json({ success: true, message: 'Registration successful!' });
        });
    });
});

// Student Dashboard 
app.get('/student-dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.redirect('/');  
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'student-dashboard.html'));
});

// Student Submit 
app.post('/submit-student', (req, res) => {
    const { first_name, middle_name, last_name, gender, email, student_id, classes } = req.body;

    const full_name = `${first_name} ${middle_name ? middle_name + " " : ""}${last_name}`;
    
    console.log('Full Name:', full_name);

    const insertQuery = 'INSERT INTO dashboard (first_name, middle_name, last_name, gender, email, student_id, classes, full_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(insertQuery, [first_name, middle_name, last_name, gender, email, student_id, classes, full_name], (err, result) => {
        if (err) {
            console.error('Error:', err);  
            return res.json({ success: false, message: 'Error saving student record' });
        }
        console.log('Record saved successfully');
        return res.json({ success: true, message: 'Student record saved successfully' });
    });
}); 

app.get('/logout',(req, res) => {
    req.session.destroy((err) => {
        if (err){
            return res.status(500).json({success: false, message: 'Logout failed'});

        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});
    
// Admin Login 
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admins WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'An error occurred while querying the database.' });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        const admin = result[0];

        if (password !== admin.password) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }

        req.session.admin = admin;

        return res.json({ success: true, message: 'Login successful' });
    });
});

app.get('/admin-dashboard', (req, res) => {
    if (!req.session.admin || req.session.admin.role !== 'admin') {
        console.log("Admin session not found or insufficient privileges. Redirecting to login.");
        return res.redirect('/');  
    }

    console.log("Admin session found. Serving admin dashboard.");
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin-dashboard.html'));
});

app.get('/total-registered',(req, res)  => {
    const query = 'SELECT COUNT(*) AS totalRegistered FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching total registered:', err);
            return res.json({ success: false, message: 'Error fetching total registered' });
        }
        res.json({ success: true, totalRegistered: results[0].totalRegistered });
    });
});

app.get('/search-students', (req, res) => {
    const query = req.query.query; 
    if (!query) {
        return res.json({ success: false, message: "Query is required" });
    }

    const searchQuery = `
        SELECT id, full_name, email, username
        FROM students
        WHERE full_name LIKE ? OR email LIKE ? OR username LIKE ?
    `;
    const searchTerm = `%${query}%`; 

    db.query(searchQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, message: 'Error searching students' });
        }

        res.json({
            success: true,
            students: results
        });
    });
});

app.get('/total-dashboard-records', (req, res) => {
    const query = 'SELECT COUNT(*) AS totalRecords FROM dashboard';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching total records:', err);
            return res.json({ success: false, message: 'Error fetching total records' });
        }
        res.json({ success: true, totalRecords: results[0].totalRecords });
    });
});
app.get('/get-student-data', (req, res) => {
    const query = 'SELECT * FROM dashboard';  

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching student data:', err);
            return res.json({ success: false, message: 'Error fetching student data' });
        }
        res.json(results); 
    });
});
app.post('/update-student', (req, res) => {
    const { id, full_name, gender, email, classes } = req.body;
    
    const query = `UPDATE dashboard SET full_name = ?, gender = ?, email = ?, classes = ? WHERE id = ?`;
    db.query(query, [full_name, gender, email, classes, id], (err, result) => {
        if (err) {
            console.error("Error updating student data:", err);
            return res.json({ success: false, message: 'Failed to update student information.' });
        }
        res.json({ success: true, message: 'Student information updated successfully!' });
    });
});

app.post('/delete-student', (req, res) => {
    const { id } = req.body;

    const deleteQuery = 'DELETE FROM dashboard WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error deleting student data:', err);
            return res.json({ success: false, message: 'Error deleting student data' });
        }

        const updateCountQuery = 'SELECT COUNT(*) AS totalRecords FROM dashboard';
        db.query(updateCountQuery, (err, results) => {
            if (err) {
                console.error('Error fetching total records:', err);
                return res.json({ success: false, message: 'Error fetching total records count' });
            }

           
            res.json({ success: true, totalRecords: results[0].totalRecords });
        });
    });
});
app.post('/api/u-unique-announcements', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and Content are required!' });
    }

    const sql = 'INSERT INTO u_unique_announcements (u_title, u_content) VALUES (?, ?)';
    db.query(sql, [title, content], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error adding announcement.' });
        }
        res.status(201).json({ success: true, message: 'Announcement added successfully!' });
    });
});

app.get('/api/u-unique-announcements', (req, res) => {
    const sql = 'SELECT * FROM u_unique_announcements ORDER BY u_created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ message: 'Error fetching announcements.' });
        }
        res.json(results); 
    });
});


app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
