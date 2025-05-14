const express = require('express');
const db = require('./models');
const authRoutes = require('./Routes/Auth');
const todoRoutes = require('./Routes/Todos'); // ✅ Add this line
const cors = require('cors');

const app = express(); // This comes first
app.use(cors());
app.use(express.json()); // Parse JSON
app.use('/api/auth', authRoutes); // Load auth routes
app.use('/api/todos', todoRoutes); // ✅ Add this route

app.get('/', (req, res) => {
  res.send('API working...');
});

db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced ✅');
  app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
  });
});
