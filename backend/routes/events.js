const express = require('express');
const router = express.Router();
const multer = require('multer');
const Event = require('../models/Event');

// Use memory storage (no disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/events — Add new event with image
router.post('/', upload.single('poster'), async (req, res) => {
  try {
    const { name, place, date } = req.body;

    const newEvent = new Event({
      name,
      place,
      date,
      poster: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created', event: newEvent });
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// GET /api/events — Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id/poster — Serve image as base64
router.get('/:id/poster', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.poster || !event.poster.data) {
      return res.status(404).json({ error: 'Poster not found' });
    }

    res.contentType(event.poster.contentType);
    res.send(event.poster.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});
// DELETE event by ID
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});


module.exports = router;
