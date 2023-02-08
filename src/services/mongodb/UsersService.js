const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async verifyUserCredential(username, password) {
    const result = await this.#db.collection('users')
      .findOne({ username }, {
        projection: {
          _id: 0,
        },
      });

    if (!result) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, hashedPassword } = result;

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }

  async #verifyNewUsername(username) {
    const result = await this.#db.collection('users')
      .countDocuments({ username });

    console.log(result);
    if (result > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async addUser({ username, password }) {
    await this.#verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.#db.collection('users').insertOne({
      id,
      username,
      hashedPassword,
    });
    const { id: userId } = await this.#db.collection('users')
      .findOne({ _id: createdUser.insertedId }, { projection: { _id: 0, id: 1 } });
    return userId;
  }

  async getUserById(id) {
    const user = await this.#db.collection('users')
      .findOne({ id }, {
        projection: {
          _id: 0,
          id: 1,
          username: 1,
        },
      });

    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return user;
  }
}

module.exports = UsersService;
