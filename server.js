const express = require('express');
const app = express();
const expbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const config = require('./config/config');
const stripe = require('stripe')(process.env.PRIVATE_KEY);

const port = process.env.PORT;

app.engine('handlebars', expbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', 'handlebars');

//mount static files
app.use(express.static('public')); 

//set body-parser for json and urlencoded data
app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({
    extended: true
}));


const comp1 = {
    _id: 1,
    name: 'iMac Basic',
    price: 1000,
}

const comp2 = {
    _id: 2,
    name: 'iMac Pro',
    price: 1200
}

const comp3 = {
    _id: 3, 
    name: 'iMac X',
    price: 1500
}


//use to inject scripts into hbs templates
const scripts = [{script: '/javascript/buy.js'}];

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Ecommerce Store',
        comp1: comp1,
        comp2: comp2,
        comp3: comp3
    });
})

app.get('/buy/:compID', (req, res) => {
    if (req.params.compID === 'comp1') {
        res.render('buy', {
            title: 'Purchase Page',
            scripts: scripts,
            computer: comp1
        });
    } else if (req.params.compID === 'comp2') {
        res.render('buy', {
            title: 'Purchase Page',
            scripts: scripts,
            amount: 1200,
            computer: comp2
        });
    } else if (req.params.compID === 'comp3') {
        res.render('buy', {
            title: 'Purchase Page',
            scripts: scripts,
            amount: 1500,
            computer: comp3
        });
    }
})

app.post('/charge', (req, res) => {
    var comp_id = req.body.computer_data;
    var computer;
    
    if (comp_id === '1'){
        computer = comp1;
    } else if (comp_id === '2') {
        computer = comp2;
    } else if (comp_id === '3') {
        computer = comp3;
    }

    console.log(computer);

    stripe.charges.create({
        amount: computer.price,
        currency: "cad",
        source: req.body.token_id, // obtained with Stripe.js
        description: `Charge for ${computer.name}`
    }, function(err, charge) {
        console.log(`Completed purchased of ${computer.name} for $${computer.price}`)
        res.render('success', {
            computer_name: computer.name,
            computer_price: computer.price
        })
    });
})


app.listen(port, ()=> {
    console.log('Server is starting at port ', port)
});