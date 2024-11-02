// Import NewsApi and configure environment variables
import NewsApi from 'newsapi';
import dotenv from 'dotenv';

dotenv.config();

const newsapi = new NewsApi(process.env.NEWS_API_KEY);

export const getLatestNews = async (req, res) => {
    try {
        // Extract query parameters from the request
        const { category, language, country, q } = req.query;

        // Check if at least one query parameter is provided
        if (!category && !language && !country && !q) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one of category, language, country, or q is required'
            });
        }

        // Make an API call to get top headlines
        const response = await newsapi.v2.topHeadlines({
            category,
            language,
            country,
            q,
            pageSize: 10 // You can also pass pageSize as a query param if needed
        });

        // Check the API response status
        if (response.status === 'ok') {
            // Return the articles in the response
            res.json({
                status: 'success',
                data: response.articles
            });
        } else {
            // Handle unexpected API response
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch news'
            });
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
};
