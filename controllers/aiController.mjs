import axios from "axios";

const CLARIFAI_API_KEY = 'f3e567daca3c4ff08c333934ac12faec';
const PAT = '14b5738445b9425d8caea770964caf04';    
const USER_ID = 'openai';
const APP_ID = 'dall-e';
const MODEL_ID = 'dall-e-3';
const MODEL_VERSION_ID = 'dc9dcb6ee67543cebc0b9a025861b868';

export const createImage = async (req, res) => {
  const { tag } = req.body;

  if (!tag) {
    return res.status(400).json({ error: 'Tag is required' });
  }

  try {
    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
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
          Authorization: `Key ${PAT}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('response.data', response.data.outputs[0]?.data.image.base64);
    

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
