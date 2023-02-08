const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
// const mapDBToModel = require('../../utils');

class FoodCaloriesService {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async addFoodCalorie(payload) {
    const id = `food-${nanoid(16)}`;
    const createdAt = new Intl.DateTimeFormat('id-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date());
    const foodCalorie = { id, ...payload, createdAt };

    const addFoodCalorie = await this.#db.collection('foodCalories').insertOne(foodCalorie);
    const { id: foodId } = await this.#db.collection('foodCalories')
      .findOne({ _id: addFoodCalorie.insertedId }, { projection: { _id: 0, id: 1 } });

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
          _id: null,
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
    ];
    const cursor = this.#db.collection('foodCalories').aggregate(pipeline);
    const foodCalories = await cursor.toArray();

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
          calorie: {
            $multiply: ['$calorie', '$quantity'],
          },
        },
      },
    ];
    const cursor = this.#db.collection('foodCalories').aggregate(pipeline);
    const foodCalories = await cursor.toArray();

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
    const result = await this.#db.collection('foodCalories')
      .updateOne({ id }, updateDoc);

    if (!result.matchedCount) {
      throw new NotFoundError('gagal memperbarui makanan, id tidak ditemukan');
    }
  }

  async deleteFoodCalorieById(id) {
    const result = await this.#db.collection('foodCalories')
      .deleteOne({ id });

    if (!result.deletedCount) {
      throw new NotFoundError('gagal menghapus makanan, id tidak ditemukan');
    }
  }
}

module.exports = FoodCaloriesService;
