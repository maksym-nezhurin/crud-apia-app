import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const USER_ID = 'openai';
const APP_ID = 'dall-e';
const API_URL = `${process.env.CLARIFAI_URL}/${process.env.MODEL_ID}/versions/${process.env.MODEL_VERSION_ID}/outputs`

export const createImage = async (req, res) => {
  const { tag } = req.body;

  if (!tag) {
    return res.status(400).json({ error: 'Tag is required' });
  }

  try {
    const response = await axios.post(
        API_URL,
      {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID,
        },
        inputs: [
          {
            data: {
              text: {
                raw: tag
              }
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Key ${process.env.PAT}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Check if response contains the generated image URL
    const generatedImageUrl = response.data.outputs[0]?.data?.image?.base64;

    if (generatedImageUrl) {
      res.json({ data: { imageUrl: generatedImageUrl }});
    } else {
      res.status(500).json({ error: 'Image could not be generated' });
    }
  } catch (error) {
    if (error.response) {
      // Forward the API's status code and message
      res.status(error.response.status).json({
        message: error.response.data.status.description + ': ' + error.response.statusText,
        details: error.response.data
      });
    } else {
      // General server error (no response from API or network issue)
      res.status(503).json({ message: 'Image generation service unavailable. Please try again later.' });
    }
  }
};
