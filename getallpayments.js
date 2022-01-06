const stripe = require('stripe')("sk_test_51JT2igLjJlE6s6hjibJ40WjiKsTzBeapzMhH7AqXfwqj1u9rxNnqcUAocs1mABGqarAbp3fVvxIXkw2k5gmOMTZ600zXhoftCg");

async function g() {
    const charges = await stripe.charges.list({});
    await console.log(charges.data.length)
}

g()