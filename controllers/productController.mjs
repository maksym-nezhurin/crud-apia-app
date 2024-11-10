import Product from "../models/Product.mjs";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
    try {
        console.log('pr', req.body)
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            description: req.body.description,
            image: req.file.path, // Save the path of the uploaded image
            price: req.body.price,
            availability: req.body.availability
        });
        await product.save();
        res.status(201).json({ data: { message: 'Product successfully created', product }});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export async function getProducts(req, res) {
    try {
        let query = {};
        if (req.query.status) {
            query.isDeleted = req.query.status === 'deleted'; // Adjust based on how you want to filter
        }
        const products = await Product.find(query);
        res.status(200).json({
            data: {
                message: 'Products received successfully',
                products
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getProductItem(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        // The { new: true } option ensures that the response returns the updated document.
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function deleteProduct(req, res) {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true } // Return the updated document
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

