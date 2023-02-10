const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class FoodCaloriesService {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async addFoodCalorie(payload) {
    const id = `food-${nanoid(16)}`;
    const foodCalorie = { id, ...payload };

    const addFoodCalorie = await this.#db
      .collection('foodCalories')
      .insertOne(foodCalorie)
      .catch((err) => {
        console.error(err);
      });
    const { id: foodId } = await this.#db
      .collection('foodCalories')
      .findOne(
        { _id: addFoodCalorie.insertedId },
        { projection: { _id: 0, id: 1 } },
      )
      .catch((err) => {
        console.error(err);
      });

    if (!foodId) {
      throw new InvariantError('Makanan gagal ditambahkan');
    }

    return foodId;
  }

  async getFoodCaloriesByUserId(userId) {
    const pipeline = [
      { $match: { userId } },
      {
        $group: {
          _id: '$createdAt',
          createdAt: { $first: '$createdAt' },
          totalCalories: {
            $sum: { $multiply: ['$calorie', '$quantity'] },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ];
    const cursor = this.#db.collection('foodCalories').aggregate(pipeline);
    const foodCalories = await cursor.toArray().catch((err) => {
      console.error(err);
    });

    return foodCalories.map((food) => {
      const totalCalories = parseFloat(food.totalCalories).toFixed(1);
      return { createdAt: food.createdAt, totalCalories };
    });
  }

  async getFoodCaloriesByUserIdAndDate({ userId, date }) {
    const pipeline = [
      { $match: { userId, createdAt: date } },
      {
        $project: {
          _id: 0,
          id: 1,
          foodName: 1,
          quantity: 1,
          createdAt: 1,
          calorie: {
            $multiply: ['$calorie', '$quantity'],
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
    ];
    const cursor = this.#db.collection('foodCalories').aggregate(pipeline);
    const foodCalories = await cursor.toArray().catch((err) => {
      console.error(err);
    });

    return foodCalories.map((food) => {
      const calorie = parseFloat(food.calorie).toFixed(1);
      return { ...food, calorie };
    });
  }

  async getFoodCaloriesByKeyword({ userId, date, keyword }) {
    const pipeline = [
      {
        $match: {
          userId,
          createdAt: date,
          $text: {
            $search: `${keyword}`,
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          foodName: 1,
          calorie: {
            $multiply: ['$calorie', '$quantity'],
          },
          quantity: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          foodName: 1,
        },
      },
    ];
    const cursor = this.#db.collection('foodCalories').aggregate(pipeline);
    const foodCalories = await cursor.toArray().catch((err) => {
      console.error(err);
    });

    return foodCalories.map((food) => {
      const calorie = parseFloat(food.calorie).toFixed(1);
      return { ...food, calorie };
    });
  }

  async editFoodCalorieById({ id, quantity }) {
    const updateDoc = {
      $set: {
        quantity,
      },
    };
    const result = await this.#db
      .collection('foodCalories')
      .updateOne({ id }, updateDoc)
      .catch((err) => {
        console.error(err);
      });

    if (!result.matchedCount) {
      throw new NotFoundError('gagal memperbarui makanan, id tidak ditemukan');
    }
  }

  async deleteFoodCalorieById(id) {
    const result = await this.#db
      .collection('foodCalories')
      .deleteOne({ id })
      .catch((err) => {
        console.error(err);
      });

    if (!result.deletedCount) {
      throw new NotFoundError('gagal menghapus makanan, id tidak ditemukan');
    }
  }
}

module.exports = FoodCaloriesService;
