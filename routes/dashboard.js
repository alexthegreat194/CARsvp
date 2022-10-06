const express = require('express');
const router = express.Router();

const { users, cars, events, eventAttending } = require('../db/mongo');
const { ObjectId } = require('mongodb');

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
    const eventsFound = await events.find({ownerId: req.session.user._id}).toArray();

    let eventsFoundWithCars = await Promise.all(eventsFound.map(async (event) => {
        
        const rsvps = await eventAttending.find({eventId: event._id.toString()}).toArray();
        console.log(rsvps);
        
        const peopleIds = rsvps.map(rsvp => rsvp.userId);
        console.log(peopleIds);
        const people = await Promise.all(peopleIds.map(async (id) => {
            const person = await users.findOne({_id: ObjectId(id)});
            return person;
        }));
        console.log(people);
        
        let carsFound = [];

        for (let i = 0; i < people.length; i++) {
            console.log("individual person:", people[i]);
            const personCars = await cars.find({
                ownerId: people[i]._id.toString()
            }).toArray();
            console.log("personCars:", personCars);
            carsFound = [...carsFound, ...personCars];
        }
        // console.log("found Cars", carsFound);

        let seats = 0;
        for (let i = 0; i < carsFound.length; i++) {
            // console.log("car:", carsFound[i]);
            seats += parseInt(carsFound[i].seats);
        }

        return {
            ...event,
            cars: carsFound,
            seats: seats,
            people: people,
            peopleAmount: people.length,
        }
    }));

    // get all events that the user is attending
    const rsvps = await eventAttending.find({userId: req.session.user._id}).toArray();
    // console.log(rsvps);

    const eventIds = rsvps.map(rsvp => rsvp.eventId);

    // get all events that the user is attending
    const foundEvents = await events.find({
        _id: {
            $in: eventIds
        }
    }).toArray();

    //add cars to events
    // console.log("foundEvents", foundEvents);
    let foundEventsWithCars = await foundEvents.map(async (event) => {
        const eventRsvps = await eventAttending.find({eventId: event._id}).toArray();
        // console.log(eventRsvps);
        const peopleIds = eventRsvps.map(rsvp => rsvp.userId);
        // console.log(peopleIds);
        // console.log(req.session.user);
        let people = await peopleIds.map(async (id) => {
            const person = await users.findOne({_id: ObjectId(id)});
            return person;
        });
        
        people = await Promise.all(people);
        // console.log(people);

        event.people = people;
        event.peopleAmount = people.length;

        const carsFound = await cars.find({
            ownerId: {
                $in: peopleIds
            }
        }).toArray();
        // console.log(carsFound);

        event.cars = carsFound;
        let seats = 0;
        carsFound.forEach(car => {
            seats += parseInt(car.seats);
        });

        event.seats = seats;
        // console.log(seats);
        // console.log(event);
        return await event;
    });

    foundEventsWithCars = await Promise.all(foundEventsWithCars);

    // console.log("foundEventsWithCars:", foundEventsWithCars);

    res.render('dashboard', {
        user: req.session.user, 
        cars: carsFound,
        events: eventsFoundWithCars,
        attending: foundEventsWithCars
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

router.post('/events/new', async (req, res) => {
    const { title, description, date } = req.body;
    const event = await events.insertOne({
        title,
        description,
        date,
        ownerId: req.session.user._id
    });

    const rsvp = await eventAttending.insertOne({
        eventId: event.insertedId.toString(),
        userId: req.session.user._id
    });

    res.redirect('/dashboard');
});

router.get('/events/:id/delete', async (req, res) => {
    const { id } = req.params;
    await events.deleteOne({ _id: ObjectId(id) });

    await eventAttending.deleteMany({ eventId: ObjectId(id) });

    res.redirect('/dashboard');
});

router.get('/events/:id/join', async (req, res) => {
    const { id } = req.params;
    
    const foundRsvp = await eventAttending.findOne({
        eventId: ObjectId(id),
        userId: req.session.user._id
    });

    if (foundRsvp) {
        console.log('Already joined');
        return res.redirect('/dashboard');
    }

    const rsvp = await eventAttending.insertOne({
        eventId: ObjectId(id),
        userId: req.session.user._id
    });

    console.log('Joined event');

    res.redirect('/dashboard');
});

router.post('/events/code/join', async (req, res) => {
    const { code } = req.body;
    res.redirect(`/events/${code}/join`);
});

router.get('/events/:id/leave', async (req, res) => {
    const { id } = req.params;

    const foundEvent = await events.findOne({
        _id: ObjectId(id)
    });

    if (foundEvent.ownerId === req.session.user._id) {
        console.log('Cannot leave your own event');
        return res.redirect('/dashboard');
    }

    await eventAttending.deleteOne({
        eventId: ObjectId(id),
        userId: req.session.user._id
    });

    console.log('Left event');

    res.redirect('/dashboard');
});

module.exports = router;