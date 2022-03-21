const { Order, Pet, sequelize } = require('../models');
const filterBody = require('../services/filterBody.service');

const validOrderKeys = ['petId', 'quantity', 'shipDate'];

exports.placeOrder = async (req, res) => {
  const authUser = req.authUser;
  try {
    const result = await sequelize.transaction(async (t) => {
      const { petId, quantity, shipDate } = filterBody(
        validOrderKeys,
        req.body
      );

      const pet = await Pet.findByPk(petId);

      if (pet.status !== 'available') {
        throw new Error('Pet is not available');
      }

      const order = await Order.create(
        {
          petId,
          quantity,
          shipDate,
          userId: authUser.id,
          status: 'placed',
          complete: false,
        },
        { transaction: t }
      );

      pet.status = 'pending';
      await pet.save({ transaction: t });

      return order;
    });

    res.status(201).send(result);
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
    await sequelize.transaction(async (t) => {
      const order = await Order.findByPk(id);
      await Pet.update(
        { status: 'available' },
        { where: { id: order.petId }, transaction: t }
      );
      const num = await Order.destroy({ where: { id }, transaction: t });

      if (!num) {
        throw new Error('Order not found');
      }
    });

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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const id = req.params.id;

  try {
    await sequelize.transaction(async (t) => {
      const { status } = filterBody(validOrderKeys, req.body);

      const order = await Order.findByPk(id);
      const pet = await Pet.findByPk(order.petId);

      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;

      if (status === 'delivered') {
        order.complete = true;
        pet.status = 'sold';
      }

      await order.save({ transaction: t });
      await pet.save({ transaction: t });
    });

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
