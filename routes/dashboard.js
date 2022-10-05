const express = require('express');
const router = express.Router();

const { users, cars } = require('../db/mongo');

router.use((req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
});

router.get('/dashboard', async (req, res) => {
    
    // console.log(req.session);

    const carsFound = await cars.find({ownerId: req.session.user._id}).toArray();

    res.render('dashboard', {
        user: req.session.user, 
        cars: carsFound
    });
});


router.post('/cars/new', async (req, res) => {
    const { name, seats } = req.body;
    const car = await cars.insertOne({
        name,
        seats,
        ownerId: req.session.user._id
    });

    res.redirect('/dashboard');
});

router.post('/cars/:id/delete', async (req, res) => {
    const { id } = req.params;
    await cars.deleteOne({ _id: ObjectId(id) });
    res.redirect('/dashboard');
});

module.exports = router;