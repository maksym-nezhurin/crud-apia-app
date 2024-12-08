import Stripe from 'stripe';
import Joi from 'joi'; // Install with npm install joi
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentSchema = Joi.object({
    paymentMethodId: Joi.string().required(),
    amount: Joi.number().positive().required(),
});

export const checkoutUserData = async (req, res) => {
    console.log('Checkout User Data');
    // Access form fields
    console.log(req.body); // Prints all the text fields from the multipart/form data
    console.log(req.body.orderId); // Prints all the text fields from the multipart/form data

    res.status(200).send({ data: {
        message: 'data successfully saved',
            id: 1
    }});
}

const convertValueToCurrency = async (amount, currency = 'PLN') => {
    try {
        const response = await axios.get(process.env.EXCHANGE_API_URL + '/USD');
        const rates = response.data.rates;
        const usdToPlnRate = rates[currency];

        if (!usdToPlnRate) {
            throw new Error(`${currency} rate not available`);
        }

        // Perform conversion
        const amountInPLN = amount * usdToPlnRate;

        return {
            success: true,
            amountInPLN,
            rate: usdToPlnRate,
        };
    } catch (error) {
        console.error('Error converting USD to PLN:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

export const createPayment = async (req, res) => {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { paymentMethodId, amount } = value;
    const { amountInPLN } = await convertValueToCurrency(amount);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPLN * 100, // Convert dollars to cents
            currency: 'pln',
            payment_method: paymentMethodId,
            // confirmation_method: 'manual',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            // confirm: true,
        });

        res.json({
            data: { clientSecret: paymentIntent.client_secret }
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
}
