const express = require('express');
const { users } = require('./storage');
const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Simple in-memory user creation
  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);

  res.status(201).json({ message: 'User registered', user: newUser });
});

router.get('/users', (req, res) => {
  res.status(200).json({ users });
});

users.push(newUser);
saveData();  // Save to file
res.status(201).json({ message: 'User registered', user: newUser });

applications.push(newApplication);
saveData();  // Save to file
res.status(201).json({ message: 'Application submitted', application: newApplication });


module.exports = router;
