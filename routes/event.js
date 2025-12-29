const express = require('express');
const router = express.Router();

// --- Page Routes ---

// This is now the FIRST route.
// This makes http://localhost:3000/ redirect to your landing page.
router.get('/', (req, res) => {
    res.redirect('/landing');
});

// The dashboard is now at its own URL: /dashboard
router.get('/dashboard', (req, res) => {
    res.render('index', { currentPage: 'index' });
});

// Past Events
router.get('/past', (req, res) => {
    res.render('past', { currentPage: 'past' });
});

// Scheduled Events
router.get('/schedule', (req, res) => {
    res.render('schedule', { currentPage: 'schedule' });
});

// Shared Reminders
router.get('/shared', (req, res) => {
    res.render('shared', {
        currentPage: 'shared',
        title: 'Shared Reminders & Spaces',
        subtitle: 'Manage events and calendars shared with your team.'
    });
});

// Collaboration Mode
router.get('/colabration', (req, res) => {
    res.render('colabration', {
        currentPage: 'colabration',
        title: 'Collaboration Mode',
        subtitle: 'Manage your team members and their permissions.'
    });
});

// Feedback
router.get('/feedback', (req, res) => {
    res.render('feedback', {
        currentPage: 'feedback',
        title: 'Help & Feedback',
        subtitle: '' // Subtitle is optional
    });
});

// Settings
router.get('/settings', (req, res) => {
    res.render('settings', {
        currentPage: 'settings',
        title: 'Account & Settings',
        subtitle: ''
    });
});


//  Standalone Pages (No Main Layout) 

// Add Event (Modal Page)
router.get('/add', (req, res) => {
    res.render('add');
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// Landing Page
router.get('/landing', (req, res) => {
    // This is a good place for your landing page
    res.render('landing');
});

// We deleted the extra router.get('/') from the bottom

module.exports = router;