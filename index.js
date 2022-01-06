const express = require('express');
const app = express();
const stripe = require('stripe')("sk_test_51JT2igLjJlE6s6hjibJ40WjiKsTzBeapzMhH7AqXfwqj1u9rxNnqcUAocs1mABGqarAbp3fVvxIXkw2k5gmOMTZ600zXhoftCg");
var bodyParser = require('body-parser');
const crypto = require("crypto")

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
            allowed_countries: ["AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW", "ZZ"],
        },
        shipping_options: [
            {
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: 99,
                        currency: 'eur',
                    },
                    display_name: 'Shipping',
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: req.body.delivery_estimate_minimum,
                        },
                        maximum: {
                            unit: 'business_day',
                            value: req.body.delivery_estimate_maximum,
                        },
                    }
                },
            },
        ],
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: req.body.name,
                    },
                    unit_amount: req.body.price * 100,
                },
                quantity: 1,
            },
        ],
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
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            console.log(paymentIntent)
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);
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


app.listen(port, () => console.log(`Listening on port ${port}!`));