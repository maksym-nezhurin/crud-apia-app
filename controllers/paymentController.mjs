import Stripe from 'stripe';
const stripe = Stripe('pk_test_51QID7gKXpmxOoBq6YPZ1233Otn3dvNk33RstTnqbWlKhO9dritCeeaeLPqnGRvRbeCBw0VGTDrFRNiE2pCsb2cpN00ij8zwPQg');

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
    console.log('createPayment')
    const { paymentMethodId, amount } = req.body;

    try {
        console.log('paymentMethodId, amount', amount)
        res.json({ clientSecret: '12121212'});
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: amount * 100, // Convert dollars to cents
        //     currency: 'usd',
        //     payment_method: paymentMethodId,
        //     confirmation_method: 'manual',
        //     confirm: true,
        // });
        // res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
}