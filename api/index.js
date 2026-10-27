const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Fallback to system DNS
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'hotelbazaar_jwt_secret_token_secure_2026';
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in dev to avoid blocking
    }
}));

// MongoDB Connection
const rawURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/booking-app';
const MONGO_URI = rawURI.replace(/:\s*<([^>]+)>\s*@/, (match, p1) => ':' + encodeURIComponent(p1) + '@');

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connected to MongoDB Database.'))
.catch(err => {
    console.error('⚠️ MongoDB connection error:', err.message);
    console.info('💡 Ensure MongoDB Atlas connection string is provided in api/.env as MONGO_URL');
});

// Database connectivity guard
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1 && req.path !== '/api/test' && req.path !== '/') {
        return res.status(503).json({
            error: 'Database connection unavailable. Please check MONGO_URL in api/.env.'
        });
    }
    next();
});

// Helper to extract authenticated user from cookie
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (!token) return reject(new Error('No token provided'));

        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) return reject(err);
            resolve(userData);
        });
    });
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'MERN Booking App API',
        status: 'active',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
    });
});

app.get('/api/test', (req, res) => {
    res.json('test passed');
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ error: 'Email is already registered.' });
        }

        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json({ name: userDoc.name, email: userDoc.email, _id: userDoc._id });
    } catch (e) {
        res.status(422).json({ error: e.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userDoc = await User.findOne({ email });
        if (userDoc) {
            const passOk = bcrypt.compareSync(password, userDoc.password);
            if (passOk) {
                jwt.sign({
                    email: userDoc.email,
                    id: userDoc._id
                }, jwtSecret, { expiresIn: '7d' }, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token, {
                        httpOnly: true,
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    }).json({
                        name: userDoc.name,
                        email: userDoc.email,
                        _id: userDoc._id
                    });
                });
            } else {
                res.status(422).json({ error: 'Incorrect password.' });
            }
        } else {
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// User Profile
app.get('/api/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) return res.json(null);
            try {
                const user = await User.findById(userData.id);
                if (!user) return res.json(null);
                const { name, email, _id } = user;
                res.json({ name, email, _id });
            } catch (e) {
                res.json(null);
            }
        });
    } else {
        res.json(null);
    }
});

// User Logout
app.post('/api/logout', (req, res) => {
    res.cookie('token', '', { maxAge: 0 }).json(true);
});

// Upload Photo by Link (URL)
app.post('/api/upload-by-link', async (req, res) => {
    const { link } = req.body;
    if (!link) return res.status(400).json({ error: 'No image link provided' });

    try {
        const newName = 'photo_' + Date.now() + '.jpg';
        const destPath = path.join(uploadsDir, newName);

        await imageDownloader.image({
            url: link,
            dest: destPath,
        });

        res.json(newName);
    } catch (e) {
        res.status(500).json({ error: 'Failed to download image from link: ' + e.message });
    }
});

// Upload Photos from Local Device
const photosMiddleware = multer({ dest: uploadsDir });
app.post('/api/upload', photosMiddleware.array('photos', 50), (req, res) => {
    try {
        const uploadedFiles = [];
        if (!req.files || req.files.length === 0) {
            return res.json([]);
        }

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const originalname = file.originalname || 'image.jpg';
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1] || 'jpg';
            const newFilename = file.filename + '.' + ext;
            const newPath = path.join(uploadsDir, newFilename);

            fs.renameSync(file.path, newPath);
            uploadedFiles.push(newFilename);
        }

        res.json(uploadedFiles);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Place Listing
app.post('/api/places', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const {
        title, address, addedPhotos, description, price,
        perks, extraInfo, checkIn, checkOut, maxGuests,
    } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        try {
            const placeDoc = await Place.create({
                owner: userData.id,
                price: Number(price) || 100,
                title,
                address,
                photos: addedPhotos || [],
                description,
                perks: perks || [],
                extraInfo,
                checkIn: Number(checkIn) || 14,
                checkOut: Number(checkOut) || 11,
                maxGuests: Number(maxGuests) || 1,
            });
            res.json(placeDoc);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// Get User's Own Place Listings
app.get('/api/user-places', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        try {
            const places = await Place.find({ owner: userData.id });
            res.json(places);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// Get Single Place by ID
app.get('/api/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findById(id);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        res.json(place);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Place Listing
app.put('/api/places', async (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const {
        id, title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        try {
            const placeDoc = await Place.findById(id);
            if (!placeDoc) return res.status(404).json({ error: 'Place not found' });

            if (userData.id === placeDoc.owner.toString()) {
                placeDoc.set({
                    title, address, photos: addedPhotos || [], description,
                    perks: perks || [], extraInfo,
                    checkIn: Number(checkIn), checkOut: Number(checkOut),
                    maxGuests: Number(maxGuests), price: Number(price),
                });
                await placeDoc.save();
                res.json('ok');
            } else {
                res.status(403).json({ error: 'Unauthorized to edit this place' });
            }
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// Get All Public Places
app.get('/api/places', async (req, res) => {
    try {
        const places = await Place.find();
        res.json(places);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const {
            place, checkIn, checkOut, numberOfGuests, name, phone, price,
        } = req.body;

        if (!place || !checkIn || !checkOut || !name || !phone) {
            return res.status(400).json({ error: 'Missing required booking details.' });
        }

        const bookingDoc = await Booking.create({
            place, checkIn, checkOut, numberOfGuests, name, phone, price,
            user: userData.id,
        });

        res.json(bookingDoc);
    } catch (e) {
        res.status(401).json({ error: e.message || 'Please log in to book.' });
    }
});

// Get User's Bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const userData = await getUserDataFromReq(req);
        const bookings = await Booking.find({ user: userData.id }).populate('place');
        res.json(bookings);
    } catch (e) {
        res.status(401).json({ error: 'Please log in to view your bookings.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Booking API Server listening on http://localhost:${PORT}`);
});
