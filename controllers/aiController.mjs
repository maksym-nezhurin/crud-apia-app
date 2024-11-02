import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CLARIFAI_API_KEY = 'f3e567daca3c4ff08c333934ac12faec';
const PAT = '14b5738445b9425d8caea770964caf04';    
const USER_ID = 'openai';
const APP_ID = 'dall-e';
const API_URL = `${process.env.CLARIFAI_URL}/${process.env.MODEL_ID}/versions/${process.env.MODEL_VERSION_ID}/outputs`

export const createImage = async (req, res) => {
  const { tag } = req.body;

  if (!tag) {
    return res.status(400).json({ error: 'Tag is required' });
  }
  // process.env.CLARIFAI_URL;
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
      res.json({ imageUrl: generatedImageUrl });
    } else {
      res.status(500).json({ error: 'Image could not be generated' });
    }
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ error: 'Could not generate image' });
  }
};
