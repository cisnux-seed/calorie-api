// import dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// notes
const foodCalories = require('./api/food_calories');
const FoodCaloriesService = require('./services/mongodb/FoodCaloriesService');

// users
const users = require('./api/users');
const UsersService = require('./services/mongodb/UsersService');
const initDb = require('./utils/initDb');

// authentications
const authentications = require('./api/authentications');

const init = async () => {
  const db = await initDb();
  const usersService = new UsersService(db);
  const foodCaloriesService = new FoodCaloriesService(db);

  const server = Hapi.server({
    port: process.env.PORT,
    // if NODE_ENV is 'production' then set ip 'localhost'
    // else set ip '0.0.0.0'
    host: process.env.HOST,
    routes: {
      cors: true,
    },
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
      },
    },
    {
      plugin: authentications,
      options: {
        usersService,
      },
    },
    {
      plugin: foodCalories,
      options: {
        service: foodCaloriesService,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
