// database/seeders/userSeeder.js
import User from '../../models/User.mjs'; // Import the User model

async function seedUsers() {
    const users = [
        {
            name: 'admin',
            email: 'admin@example.com',
            password: 'password123', // In production, hash the password
            role: 'super admin'
        },
        {
            name: 'john_doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user'
        },
        {
            name: 'Max',
            email: 'max2@example.com',
            password: '$2a$10$kS/D.5BwHAfP5caFPAT7CezaGF/RPMyUK/ABG/BRdh9J2YhjgSq2a',
            role: 'user'
        }
    ];

    try {
        await User.deleteMany({});
        console.log('Existing users cleared.');

        // Insert new users
        await User.insertMany(users);
        console.log('User seeding completed.');
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

export default seedUsers;
