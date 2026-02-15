const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User } = require('../models');

// Place Order
router.post('/', async (req, res) => {
    try {
        const { orderNumber, totalPrice, shippingName, shippingAddress, shippingCity, paymentMethod, deliveryDate, items, userId } = req.body;

        let validUserId = null;
        if (userId) {
            const user = await User.findByPk(userId);
            if (user) {
                validUserId = userId;
            } else {
                console.warn(`User ID ${userId} not found, proceeding as guest order.`);
            }
        }

        const order = await Order.create({
            orderNumber,
            totalPrice,
            shippingName,
            shippingAddress,
            shippingCity,
            paymentMethod,
            deliveryDate,
            UserId: validUserId
        });

        // Create Order Items
        for (const item of items) {
            await OrderItem.create({
                OrderId: order.id,
                ProductId: item.id,
                quantity: item.quantity,
                price: item.price
            });
        }

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get All Orders or User Orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: OrderItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.findAll({
            where: { UserId: userId },
            include: [{ model: OrderItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

module.exports = router;
