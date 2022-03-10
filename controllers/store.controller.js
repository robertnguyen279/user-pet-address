const { Order } = require('../models');

exports.placeOrder = async (req, res) => {
  const { petId, quantity, shipDate } = req.body;
  const authUser = req.authUser;
  try {
    const order = await Order.create({
      petId,
      quantity,
      shipDate,
      userId: authUser.id,
      status: 'placed',
      complete: false,
    });

    res.send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message, ...error });
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
    res.status(500).send({ message: error.message, ...error });
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
    res.status(500).send({ message: error.message, ...error });
  }
};
