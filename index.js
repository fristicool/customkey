const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || "sk_test_51JT2igLjJlE6s6hjibJ40WjiKsTzBeapzMhH7AqXfwqj1u9rxNnqcUAocs1mABGqarAbp3fVvxIXkw2k5gmOMTZ600zXhoftCg");
var bodyParser = require('body-parser');
const crypto = require("crypto")
const nodemailer = require('nodemailer');

const emailPassword = process.env.EMAIL_PASSWORD

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: "lucas1.theys@gmail.com",
        pass: emailPassword
    }
})

var cors=require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const console = require('console');
const { fstat } = require('fs');

app.use(cors());

app.use('/static', express.static('./images'));

const port = process.env.PORT || 4242
const domainUrl = process.env.DOMAINURL || 'http://localhost:4200/'

let products = [false,false,false,false,false,false,false]

app.use(bodyParser.json())

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/create-checkout-session', async (req, res) => {
    await console.log(req.body)

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
            allowed_countries: ["US", "GB", "BE", "NL", "DE", "FR"],
        },
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: process.env.SHIPPINGPRICE || 1999,
                        currency: 'eur',
                    },
                    display_name: 'Shipping',
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: 10,
                        },
                        maximum: {
                            unit: 'business_day',
                            value: 20,
                        },
                    }
                },
            },
        ],
        line_items: req.body.object,
        mode: 'payment',
        success_url: `${domainUrl}succes`,
        cancel_url: `${domainUrl}failure`,
    });

    res.send({ url: session.url });

    console.log(session)
});

// not in use:
app.post('/webhook', express.json({ type: 'application/json' }), (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const paymentIntent = event.data.object;

            console.log(paymentIntent)
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);

            message_to_customer = {
                from: "lucas1.theys@gmail.com",
                to: paymentIntent.customer_details.email,
                subject: "Purchase - Keyboard-master.be",
                text: "We are working on your order \n thanks for shopping at our shop"
            }

            message_to_me = {
                from: "lucas1.theys@gmail.com",
                to: "customkey.keyboards@gmail.com",
                subject: "new customer",
                text: paymentIntent.payment_intent
            }
            
            transporter.sendMail(message_to_customer, function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log("send mail");
                }
            })

            transporter.sendMail(message_to_me, function(err, info) {
                if (err) {
                  console.log(err)
                } else {
                  console.log("send mail");
                }
            })

            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;

            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

app.post('/switchoutofstock', (req, res) => {
    // console.log(crypto.createHash("sha256").update(req.body.password).digest('hex'))
    // console.log(req.body)

    if(crypto.createHash("sha256").update(req.body.password).digest('hex') != "900a4e5e714cbe64a5143c2261dcfacf91b877aab3f24b14914580373e6d7a4f") res.send({data: 'not authorized'})

    products[req.body.id] = !products[req.body.id]

    console.log(products)

    res.send({data: "succeed"})
})

app.post('/isoutofstock', (req, res) => {
    res.send({data: products[req.body.id]})
})

app.get('/products', (req, res) => {
    console.log(JSON.parse(process.env.PRODUCT_JSON))

    res.send(JSON.parse(process.env.PRODUCT_JSON))
})

app.listen(port, () => console.log(`Listening on port ${port}!`));