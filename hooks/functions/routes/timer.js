const express = require('express');
const router = express.Router();

// Время автоспина в формате HH:MM
let scheduledTime = '15:00';

// GET /timer - Calculate and return seconds remaining
router.get('/', (req, res) => {
  try {
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    // Получаем текущее время в Екатеринбурге (UTC+5)
    const now = new Date();
    // Получаем текущее время в UTC+5
    const yekatNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Yekaterinburg' }));

    let nextSpin = new Date(yekatNow);
    nextSpin.setHours(hours, minutes, 0, 0); // Set target time for today (в Екатеринбурге)

    // If target time has already passed today, set it for tomorrow
    if (yekatNow.getTime() > nextSpin.getTime()) {
      nextSpin.setDate(nextSpin.getDate() + 1);
    }

    const secondsRemaining = Math.max(0, Math.floor((nextSpin.getTime() - yekatNow.getTime()) / 1000));

    res.json({ secondsRemaining: secondsRemaining });
  } catch (error) {
    console.error("Error calculating timer:", error);
    res.status(500).json({ secondsRemaining: 0, error: "Failed to calculate timer" });
  }
});

// POST /timer
router.post('/', (req, res) => {
  const { time } = req.body;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return res.status(400).json({ error: 'Invalid time format' });
  scheduledTime = time;
  console.log(`Scheduled spin time updated to: ${scheduledTime}`);
  res.json({ success: true, time: scheduledTime });
});

module.exports = router;
