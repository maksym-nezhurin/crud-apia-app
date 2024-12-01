import axios from "axios";
import dotenv from "dotenv";
import ServiceAvailability from "../models/ServiceAvailability.mjs";
import AIImage from "../models/AIImage.mjs";

dotenv.config();

const SERVICE_NAME = 'clarifyImageService';
const SERVICE_AVAILABLE_REQUESTS = 1000;
const USER_ID = 'openai';
const APP_ID = 'dall-e';
const API_URL = `${process.env.CLARIFAI_URL}/${process.env.MODEL_ID}/versions/${process.env.MODEL_VERSION_ID}/outputs`

export const getAvailability = async (req, res) => {
    try {
        let serviceAvailabilityDoc = await ServiceAvailability.findOne();

        if (!serviceAvailabilityDoc) {
            serviceAvailabilityDoc = new ServiceAvailability({services: new Map()});
            await serviceAvailabilityDoc.save();
        }

        let serviceData = serviceAvailabilityDoc.services.get(SERVICE_NAME);

        if (!serviceData) {
            // Initialize the service if not present
            serviceData = {available: true, numberOfRequests: SERVICE_AVAILABLE_REQUESTS};
            serviceAvailabilityDoc.services.set(SERVICE_NAME, serviceData);
            await serviceAvailabilityDoc.save();
            return res.status(201).json({
                data: {
                    message: `Service availability data not found. Created a new one doe ${SERVICE_NAME}.`,
                    data: serviceData
                }
            });
        }

        res.status(200).json({
            data: {
                data: serviceData,
                message: 'Service is available'
            }
        });
    } catch (error) {
        console.error("Error fetching or initializing service availability:", error);
        res.status(500).json({
            data: {
                data: {},
                message: "Error retrieving or initializing service availability data."
            }
        });
    }
};

export const createImage = async (req, res) => {
    const {tag} = req.body;
    const serviceName = SERVICE_NAME; // Define a consistent service name for reference

    if (!tag) {
        return res.status(400).json({error: 'Tag is required'});
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
            // Save the image in the database
            const newImage = new AIImage({
                name: tag,
                imageData: generatedImageUrl
            });
            await newImage.save();
            await updateServiceAvailability(serviceName, true);
            res.json({data: {imageUrl: generatedImageUrl}});
        } else {
            await updateServiceAvailability(serviceName, false);
            res.status(500).json({error: 'Image could not be generated'});
        }
    } catch (error) {
        await updateServiceAvailability(serviceName, false);
        if (error.response) {
            // Forward the API's status code and message
            res.status(error.response.status).json({
                message: error.response.data.status.description + ': ' + error.response.statusText,
                details: error.response.data
            });
        } else {
            // General server error (no response from API or network issue)
            res.status(503).json({message: 'Image generation service unavailable. Please try again later.'});
        }
    }
};

// Function to update the service availability
async function updateServiceAvailability(serviceName, isAvailable) {
    const availabilityRecord = await ServiceAvailability.findOne(); // Fetch the document holding the service availability
    if (!availabilityRecord) {
        console.error('Service Availability Record not found');
        return;
    }

    const serviceData = availabilityRecord.services.get(serviceName) || {numberOfRequests: 0};
    serviceData.available = isAvailable;
    serviceData.numberOfRealRequestRequests += 1;
    serviceData.numberOfRequests -= 1;
    availabilityRecord.services.set(serviceName, serviceData);
    await availabilityRecord.save();
}

export async function getImages(req, res) {
    try {
        const images = await AIImage.find({});

        if (!images.length) {
            return res.status(200).json({
                data: {
                    images: [],
                    message: 'AI generated images not exists'
                }
            });
        }

        return res.status(200).json({
            data: {
                images,
                message: 'AI generated images exists'
            }
        });
    } catch (error) {
        console.error("Failed to fetch images", error);
        res.status(500).send("An error occurred while fetching images.");
    }
}