// database/seeders/slotSeeder.js
import Booking from '../../models/Booking.mjs';
import Slot from '../../models/Slot.mjs';

async function createSlotsForDate(date, passedSlots) {
    const slots = passedSlots.map(slot => ({
        date,
        time: slot.time,
        isBooked: false,
    }));

    try {
        await Slot.insertMany(slots);
        console.log(`Slots created for ${date.toDateString()}`);
    } catch (error) {
        console.error('Error creating slots:', error);
    }
}

export default async function seedSlots() {
    // Clear existing data in the Slot collection
    await Booking.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    console.log('Existing slot data cleared.');

    // Seed new data
    await createSlotsForDate(new Date('2024-12-12'), [
        {
            time: "12:00 PM",
            _id: "6724d33c0b03f4fb222dc26f",
            isBooked: false
        },
        {
            time: "10:00 AM",
            _id: "6724d33c0b03f4fb222dc270",
            isBooked: false
        },
        {
            time: "09:00 AM",
            _id: "6724d33c0b03f4fb222dc26e",
            isBooked: false
        }
    ]);
    await createSlotsForDate(new Date('2024-12-19'), [
        {
            time: "08:00 AM",
            _id: "6724d33c0b03f4fb222dc22f",
            isBooked: false
        },
        {
            time: "11:00 AM",
            _id: "6724d33c0b03f4fb222dc240",
            isBooked: false
        },
        {
            time: "12:00 AM",
            _id: "6724d33c0b03f4fb222dc26e",
            isBooked: false
        }
    ]);
    await createSlotsForDate(new Date('2024-12-13'), [
        {
            time: "05:00 AM",
            _id: "6724d33c0b03f4fb222dc32f",
            isBooked: false
        },
        {
            time: "06:00 AM",
            _id: "6724d33c0b03f4fb222dfc240",
            isBooked: false
        },
        {
            time: "09:00 AM",
            _id: "6724d33c0b03f4fb212dc26e",
            isBooked: false
        }
    ]);
    await createSlotsForDate(new Date('2024-12-21'), [
        {
            time: "06:00 AM",
            _id: "6724d33c0b03f4fb222dfd240",
            isBooked: false
        },
    ]);
}
