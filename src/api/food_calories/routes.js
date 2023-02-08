const routes = (handler) => [
  {
    method: 'POST',
    path: '/foodCalories',
    handler: handler.postFoodCalorieHandler,
  },
  {
    method: 'GET',
    path: '/foodCalories',
    handler: handler.getFoodCaloriesHandler,
  },
  {
    method: 'PUT',
    path: '/foodCalories/{id}',
    handler: handler.putFoodCalorieByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/foodCalories/{id}',
    handler: handler.deleteFoodCalorieByIdHandler,
  },
];

module.exports = routes;
