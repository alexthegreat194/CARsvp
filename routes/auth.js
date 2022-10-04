const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    res.redirect('/');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    const { username, password, name } = req.body;
    console.log(username, password, name);
    res.redirect('/');
});

module.exports = router;