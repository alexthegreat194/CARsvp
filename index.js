const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');

require('dotenv').config();

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}));

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

const auth = require('./routes/auth');

app.use('/', auth);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/dashboard', (req, res) => {
    
    console.log(req.session);

    if (req.session.user) {
        res.render('dashboard', {user: req.session.user});
    } else {
        res.redirect('/login');
    }

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})