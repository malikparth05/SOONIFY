require('dotenv').config(); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Static Files ---
app.use(express.static(path.join(__dirname, 'public')));


const pageRoutes = require('./routes/event');
app.use('/', pageRoutes);


try {
  const eventsApiRoutes = require('./routes/events'); 
  app.use('/api/events', eventsApiRoutes);
  console.log('/api/events routes loaded.');
} catch (err) {
  console.warn('Could not load /api/events routes.');
}

try {
  const authApiRoutes = require('./routes/auth');
  app.use('/api/auth', authApiRoutes);
  console.log('/api/auth routes loaded.');
} catch (err) {
  console.warn('Could not load /api/auth routes.');
}
  
try {
  const spacesApiRoutes = require('./routes/spaces');
  app.use('/api/spaces', spacesApiRoutes);
  console.log('/api/spaces routes loaded.');
} catch (err) {
  console.warn('Could not load /api/spaces routes.');
}
  
try {
  const settingsApiRoutes = require('./routes/settings');
  app.use('/api/settings', settingsApiRoutes);
  console.log('/api/settings routes loaded.');
} catch (err) {
  console.warn('Could not load /api/settings routes.');
}


try {
  const settingsApiRoutes = require('./routes/settings');
  app.use('/api/settings', settingsApiRoutes);
  console.log('/api/settings routes loaded.');
} catch (err) {
  console.warn('Could not load /api/settings routes.');
}


try {
  const feedbackApiRoutes = require('./routes/feedback');
  app.use('/api/feedback', feedbackApiRoutes);
  console.log('/api/feedback routes loaded.');
} catch (err) {
  console.warn('Could not load /api/feedback routes.');
}

// Connect to DB and Start Server ---
mongoose.connect(MONGO_URI)
  .then(()=> {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    app.listen(PORT, ()=> console.log(`Server running (NO DATABASE) on http://localhost:${PORT}`));
  });