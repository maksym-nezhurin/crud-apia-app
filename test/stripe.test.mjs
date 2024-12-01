import 'dotenv/config';
import Stripe from 'stripe';

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        charges: {
            create: jest.fn(() => Promise.resolve({ id: 'test_charge_id' })),
        },
    }));
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test cases
describe('Payment Tests', () => {
    it('should create a payment successfully', async () => {
        const charge = await stripe.charges.create({
            amount: 2000,
            currency: 'usd',
            source: 'tok_visa',
        });
        expect(charge).toHaveProperty('id');
    });
});
