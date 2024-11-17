import moment from 'moment-timezone';

import Slot from "../models/Slot.mjs";

export const createSlot = async (req, res) => {
    try {
        const { date, time, author, timezone } = req.body;
        const dateTime = `${date} ${time}`;
        const dateInUTC = moment.tz(dateTime, 'YYYY-MM-DD hh:mm A', timezone).utc().toDate(); // Example timezone
        console.log('user', author, dateInUTC)
        if (!author) {
            return res.status(404).json({ message: 'User not found' });
        }

        const slot = new Slot({
            date: dateInUTC,
            isBooked: false,
            author: author // Save the ObjectId of the user
        });

        const savedSlot = await slot.save();
        res.status(201).json({
            data: {
                slot: savedSlot,
                message: 'Slot successfully created!'
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create the slot',
            error: error.message
        });
    }
};

export const bookSlot = async (req, res) => {
    const {slotId, userId, firstName, lastName} = req.body;

    try {
        // Check if the slot is still available
        const slot = await Slot.findOne({_id: slotId, isBooked: false});

        if (!slot) {
            return res.status(400).json({message: 'Slot is already booked or unavailable'});
        }

        // Mark the slot as booked
        slot.isBooked = true;
        await slot.save();

        // Create a booking record
        const booking = new Booking({
            user: userId,
            slot: slot._id,
            firstName,
            lastName,
        });
        await booking.save();

        res.status(201).json({message: 'Slot booked successfully', booking});
    } catch (error) {
        res.status(500).json({message: 'Error booking slot'});
    }
}

export const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find();
        // Organize slots into the desired format
        const slotsByDate = slots.reduce((acc, slot) => {
            // Format the date as 'YYYY-MM-DD'
            const dateKey = moment(slot.date).format('YYYY-MM-DD');
            
            // Initialize the array for this date if not already present
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            
            // Add the time to the array for the given date
            acc[dateKey].push({
                time: moment(slot.date).format('hh:mm A'),
                _id: slot._id,
                isBooked: slot.isBooked
            });
            
            return acc;
        }, {});

         // Sort the times for each date
         Object.keys(slotsByDate).forEach(date => {
            slotsByDate[date].sort((a, b) => {
                const timeA = new Date(`1970-01-01T${a.time}`);
                const timeB = new Date(`1970-01-01T${b.time}`);
                return timeA - timeB; // Ascending order
            });
        });
  
      res.json({
          data: {
              slots: slotsByDate
          }
      });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSlotsByDate = async (req, res) => {
    const { date } = req.params;  // Expect date in YYYY-MM-DD format

    try {
        // Ensure the date covers the entire day from 00:00:00 to 23:59:59
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);  // Set start of the day
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);  // Set end of the day

        const slots = await Slot.find({
            date: { $gte: startDate, $lt: endDate },
        });

        if (slots.length > 0) {
            res.status(200).json({ data: {
                slots
            }});
        } else {
            res.status(200).json({ data: {
                slots: [],
                message: 'No slots found for this date'
            } });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSlot = async (req, res) => {
    const { id } = req.params;
    try {
        const slot = await Slot.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
