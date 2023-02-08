const FoodCaloriesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'foodCalories',
  version: '1.0.0',
  register: async (server, { service }) => {
    const notesHandler = new FoodCaloriesHandler(service);
    server.route(routes(notesHandler));
  },
};
