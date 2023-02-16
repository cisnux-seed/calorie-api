const axios = require('axios');
const ClientError = require('../../exceptions/ClientError');

class FoodCaloriesHandler {
  #service;

  constructor(service) {
    this.#service = service;

    this.postFoodCalorieHandler = this.postFoodCalorieHandler.bind(this);
    this.getFoodCaloriesHandler = this.getFoodCaloriesHandler.bind(this);
    this.putFoodCalorieByIdHandler = this.putFoodCalorieByIdHandler.bind(this);
    this.deleteFoodCalorieByIdHandler = this.deleteFoodCalorieByIdHandler.bind(this);
  }

  async postFoodCalorieHandler(request, h) {
    try {
      const {
        userId, foodName, quantity, createdAt,
      } = request.payload;

      const calorie = await this.#getFoodCaloryByName(foodName);

      const foodCalorieId = await this.#service.addFoodCalorie({
        userId,
        foodName,
        quantity,
        calorie,
        createdAt,
      });

      const response = h.response({
        status: 'success',
        message: 'Makanan berhasil ditambahkan',
        data: {
          foodCalorieId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getFoodCaloriesHandler(request) {
    const { userId, date, keyword } = request.query;
    let foodCalories = null;
    if (userId !== undefined && date !== undefined && keyword !== undefined) {
      foodCalories = await this.#service.getFoodCaloriesByKeyword({
        userId,
        date,
        keyword,
      });
    } else if (userId !== undefined && date !== undefined) {
      foodCalories = await this.#service.getFoodCaloriesByUserIdAndDate({
        userId,
        date,
      });
    } else {
      foodCalories = await this.#service.getFoodCaloriesByUserId(userId);
    }
    return {
      status: 'success',
      data: {
        foodCalories,
      },
    };
  }

  async putFoodCalorieByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { quantity } = request.payload;
      await this.#service.editFoodCalorieById({ id, quantity });

      return {
        status: 'success',
        message: 'Makanan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteFoodCalorieByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this.#service.deleteFoodCalorieById(id);
      return {
        status: 'success',
        message: 'Makanan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #generateRandomCalories() {
    const random = parseFloat(
      (Math.random() * (350.0 - 40.0) + 40.0).toFixed(1),
    );
    return random;
  }

  // eslint-disable-next-line class-methods-use-this
  async #getFoodCaloryByName(foodName) {
    try {
      const res = await axios.get(process.env.FOOD_CALORIES_URI, {
        params: { query: foodName },
        headers: {
          'X-Api-Key': process.env.API_KEY,
        },
      });
      if (!res.data.items.length) {
        return this.#generateRandomCalories();
      }
      return res.data.items[0].calories;
    } catch (error) {
      return this.#generateRandomCalories();
    }
  }
}

module.exports = FoodCaloriesHandler;
