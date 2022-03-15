const { Order, Pet } = require('../models');
const filterBody = require('../services/filterBody.service');

exports.placeOrder = async (req, res) => {
  const authUser = req.authUser;
  try {
    const { petId, quantity, shipDate } = filterBody(
      ['petId', 'quantity', 'shipDate'],
      req.body
    );

    const pet = await Pet.findByPk(petId);

    if (pet.status !== 'available') {
      throw new Error('Pet is not available');
    }

    const order = await Order.create({
      petId,
      quantity,
      shipDate,
      userId: authUser.id,
      status: 'placed',
      complete: false,
    });

    pet.status = 'pending';
    await pet.save();

    res.status(201).send(order);
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(400);
    } else if (error.message.includes('Pet is not available')) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.getOrderById = async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('Order not found');
    }

    res.send(order);
  } catch (error) {
    console.error(error);

    if (error.message.includes('Order not found')) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.deleteOrder = async (req, res) => {
  const id = req.params.id;
  try {
    const num = await Order.destroy({ where: { id } });

    if (!num) {
      throw new Error('Order not found');
    }

    res.send({ message: 'Delete order successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Order not found')) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};

exports.updateOrder = async (req, res) => {
  const id = req.params.id;

  try {
    const { complete } = filterBody(['status', 'complete'], req.body);

    const order = await Order.findByPk(id);
    const pet = await Pet.findByPk(order.petId);

    if (!order) {
      throw new Error('Order not found');
    }

    for (const key in req.body) {
      order[key] = req.body[key];
    }

    if (complete) {
      pet.status = 'sold';
    }

    await order.save();
    await pet.save();

    res.send({ message: 'Order updated successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Order not found')) {
      res.status(404);
    } else if (error.message.includes('Invalid request body key')) {
      res.status(400);
    } else {
      res.status(500);
    }

    res.send({ message: error.message, ...error });
  }
};
