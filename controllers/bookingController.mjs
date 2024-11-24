import moment from 'moment-timezone';

import Booking from "../models/Booking.mjs";
import Slot from '../models/Slot.mjs';

export const createBooking = async (req, res) => {
    try {
        const {slotId, timezone, firstName, lastName} = req.body;
        const slot = await Slot.findOne({_id: slotId, isBooked: false});
        const dateFromSlot = new Date(slot.date);

        // Get YYYY-MM-DD format
        const formattedDate = dateFromSlot.toISOString().slice(0, 10);

        if (!slot) {
            return res.status(400).json({message: 'Slot is already booked or unavailable'});
        }

        // Mark the slot as booked
        slot.isBooked = true;
        await slot.save();

        const dateTime = `${formattedDate} ${slot.time}`;
        const dateInUTC = moment.tz(dateTime, 'YYYY-MM-DD hh:mm A', timezone).utc().toDate();

        const booking = new Booking({
            slot: slot._id,
            date: dateInUTC,
            firstName,
            lastName,
        });
        await booking.save();
        res.status(201).json({data: {message: 'Slot booked successfully', booking}});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json({
            data: {
                bookings
            }
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getBookingByDate = async (req, res) => {
    const {date} = req.params;  // Expect date in YYYY-MM-DD format

    try {
        // Ensure the date covers the entire day from 00:00:00 to 23:59:59
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);  // Set start of the day
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);  // Set end of the day

        const bookings = await Booking.find({
            date: {$gte: startDate, $lt: endDate},
            // isDeleted: false
        });

        if (bookings.length > 0) {
            res.status(200).json({
                data: {
                    bookings
                }
            });
        } else {
            res.status(200).json({data: {bookings: [], message: 'No bookings found for this date'}});
        }
    } catch (error) {
        res.status(500).json({
            data: {
                message: error.message
            }
        });
    }
};

export const updateBooking = async (req, res) => {
    const {id} = req.params;
    try {
        const booking = await Booking.findByIdAndUpdate(id, req.body, {new: true});
        res.status(200).json({
            data: {
                booking
            }
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getBookingById = async (req, res) => {
    const {id} = req.params;
    console.log('getBookingById', id)
    try {
        const booking = await Booking.findById(id, req.body, {new: true});
        console.log('booking', booking);

        res.status(200).json({
            data: {
                booking
            }
        })
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the booking by ID
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({data: {
                    message: 'Booking not found'
                }});
        }

        // Mark the booking as deleted
        booking.isDeleted = true;
        booking.deletedAt = new Date(); // Set the deletion timestamp
        await booking.save();

        // Optionally, make the slot available again if needed
        const slot = await Slot.findById(booking.slot);
        if (slot) {
            slot.isBooked = false;
            await slot.save();
        }

        res.status(200).json({
            data: {message: 'Booking deleted successfully', booking}
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

