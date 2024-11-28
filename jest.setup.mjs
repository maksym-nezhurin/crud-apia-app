import dotenv from "dotenv";

// Load environment variables from `.env` (if needed)
dotenv.config();

// Mock NEWS_API_KEY
process.env.NEWS_API_KEY = "mocked_news_api_key";
process.env.STRIPE_SECRET_KEY = "mocked_stripe_api_key";
