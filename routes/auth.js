const express = require('express');
const router = express.Router();

const { users } = require('../db/mongo');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const generateHash = async (password) => {
    // const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await users.findOne({ username });
    if (user) {

        if (await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            console.log('Incorrect password');
            res.redirect('/login');
        }

    } else {
        console.log('Invalid username');
        res.redirect('/login');
    }

});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { username, password, name } = req.body;
    console.log(username, password, name);

    const user = await users.findOne({ username });
    if (user) {
        console.log('User already exists');
        res.render('signup', { error: 'Username already exists' });
    } else {
        const hash = await generateHash(password);
        let user = {
            username,
            password: hash,
            name
        };
        await users.insertOne(user);
        req.session.user = user;
        res.redirect('/dashboard');
    }

});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;