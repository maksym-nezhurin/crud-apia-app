import Stripe from 'stripe';
import Joi from 'joi'; // Install with npm install joi

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

export const createPayment = async (req, res) => {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { paymentMethodId, amount } = value;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Convert dollars to cents
            currency: 'pln',
            payment_method: paymentMethodId,
            // confirmation_method: 'manual',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            // confirm: true,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
}