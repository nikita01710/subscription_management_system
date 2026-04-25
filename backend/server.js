const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // connects to MySQL

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Get all subscriptions
app.get('/api/subscriptions', (req, res) => {
  db.query('SELECT * FROM subscriptions', (err, results) => {
    if (err) {
      console.error('Error fetching subscriptions:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});
// Create a new subscription
app.post('/api/subscriptions', (req, res) => {
  const { user_email, plan_name, start_date, end_date, monthly_cost, status } = req.body;

  // ✅ Step 1: Check for duplicates (same email, plan, and date range)
  const checkQuery = `
    SELECT * FROM subscriptions
    WHERE user_email = ? AND plan_name = ? AND start_date = ? AND end_date = ?
  `;

  db.query(checkQuery, [user_email, plan_name, start_date, end_date], (err, results) => {
    if (err) {
      console.error('Error checking duplicates:', err);
      return res.status(500).json({ message: 'Error checking for duplicates' });
    }

    if (results.length > 0) {
      // ❌ Duplicate found
      return res.status(400).json({ message: 'Duplicate subscription exists' });
    }

    // ✅ Step 2: Insert new subscription
    const insertQuery = `
      INSERT INTO subscriptions
      (user_email, plan_name, start_date, end_date, monthly_cost, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [user_email, plan_name, start_date, end_date, monthly_cost, status], (err, result) => {
      if (err) {
        console.error('Error inserting subscription:', err);
        return res.status(500).json({ message: 'Error inserting subscription' });
      }

      res.status(201).json({ message: 'Subscription created successfully', id: result.insertId });
    });
  });
});


// Update a subscription by ID
app.put('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  const { user_email, plan_name, start_date, end_date, monthly_cost, status } = req.body;

  if (!user_email || !plan_name || !start_date || !end_date || !monthly_cost || !status) {
    return res.status(400).json({ error: 'Please fill all fields' });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  const query = `
    UPDATE subscriptions
    SET user_email = ?, plan_name = ?, start_date = ?, end_date = ?, monthly_cost = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE subscription_id = ?
  `;

  const values = [user_email, plan_name, start_date, end_date, monthly_cost, status, id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating subscription:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription updated successfully' });
  });
});
// Delete a subscription by ID
app.delete('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM subscriptions WHERE subscription_id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting subscription:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  });
});



// Test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
