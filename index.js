const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');

require('dotenv').config();

const app = express();
app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})