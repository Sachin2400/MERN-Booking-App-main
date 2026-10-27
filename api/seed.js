const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Fallback to system DNS
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.js');
const Place = require('./models/Place.js');

const rawURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/booking-app';
const MONGO_URI = rawURI.replace(/:\s*<([^>]+)>\s*@/, (match, p1) => ':' + encodeURIComponent(p1) + '@');

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB Atlas for Booking App seeding...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clean existing
        await User.deleteMany({});
        await Place.deleteMany({});
        console.log('Cleared existing users and places.');

        // Create Default Test User
        const passwordHash = bcrypt.hashSync('password123', 10);
        const hostUser = await User.create({
            name: 'Sachin Host',
            email: 'host@example.com',
            password: passwordHash
        });

        console.log('Created Host User: host@example.com / password123');

        // Create Sample Vacation Places with real Unsplash images
        const samplePlaces = [
            {
                owner: hostUser._id,
                title: 'Luxury Seaside Oceanfront Villa',
                address: 'Malibu, California, United States',
                photos: [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
                    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
                    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80'
                ],
                description: 'Breathtaking oceanfront villa featuring private infinity pool, panoramic sunset views, private beach access, and floor-to-ceiling glass architecture.',
                perks: ['wifi', 'parking', 'tv', 'radio', 'pets'],
                extraInfo: 'Quiet hours after 10 PM. Strictly no smoking inside the residence.',
                checkIn: 15,
                checkOut: 11,
                maxGuests: 8,
                price: 450
            },
            {
                owner: hostUser._id,
                title: 'Alpine Cedar Mountain Chalet',
                address: 'Aspen, Colorado, United States',
                photos: [
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80'
                ],
                description: 'Cozy timber mountain lodge with wood-burning stone fireplace, cedar hot tub, ski-in/ski-out convenience, and sweeping alpine valley vistas.',
                perks: ['wifi', 'parking', 'tv', 'entrance'],
                extraInfo: 'All-wheel drive recommended during winter months.',
                checkIn: 16,
                checkOut: 10,
                maxGuests: 6,
                price: 320
            },
            {
                owner: hostUser._id,
                title: 'Modern Penthouse with Skyline Views',
                address: 'Manhattan, New York, United States',
                photos: [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'
                ],
                description: 'Designer duplex loft in the heart of the city with private rooftop terrace, custom chef kitchen, high-speed fiber internet, and luxury amenities.',
                perks: ['wifi', 'tv', 'radio', 'entrance'],
                extraInfo: '24/7 concierge and doorman building.',
                checkIn: 14,
                checkOut: 11,
                maxGuests: 4,
                price: 290
            },
            {
                owner: hostUser._id,
                title: 'Peaceful Evergreen Forest Cabin',
                address: 'Portland, Oregon, United States',
                photos: [
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80',
                    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80'
                ],
                description: 'Tranquil nature retreat surrounded by towering pines and ferns. Features cedar sauna, wraparound deck, outdoor firepit, and hiking trails.',
                perks: ['wifi', 'parking', 'pets'],
                extraInfo: 'Ideal for creative retreats, writers, and couples.',
                checkIn: 15,
                checkOut: 11,
                maxGuests: 3,
                price: 180
            },
            {
                owner: hostUser._id,
                title: 'Luxury Saguaro Desert Oasis',
                address: 'Scottsdale, Arizona, United States',
                photos: [
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'
                ],
                description: 'Contemporary southwestern retreat featuring heated private pool, built-in outdoor BBQ kitchen, and mesmerizing sunset desert views.',
                perks: ['wifi', 'parking', 'tv', 'entrance', 'radio'],
                extraInfo: 'Pool heating available upon request.',
                checkIn: 15,
                checkOut: 11,
                maxGuests: 6,
                price: 360
            },
            {
                owner: hostUser._id,
                title: 'Historic Tuscan Vineyard Villa',
                address: 'Florence, Tuscany, Italy',
                photos: [
                    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1200&q=80',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'
                ],
                description: 'Authentic 18th-century stone villa amidst rolling olive groves and Chianti vineyards. Features private wine cellar, terrace, and infinity pool.',
                perks: ['wifi', 'parking', 'tv', 'radio', 'pets'],
                extraInfo: 'Complimentary wine tasting included on arrival.',
                checkIn: 16,
                checkOut: 10,
                maxGuests: 10,
                price: 520
            }
        ];

        await Place.insertMany(samplePlaces);
        console.log(`Successfully seeded ${samplePlaces.length} places with images and details.`);

        console.log('✅ Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database seeding failed:', err.message);
        process.exit(1);
    }
};

seedDatabase();

