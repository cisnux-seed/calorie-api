const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  #usersService;

  constructor(usersService) {
    this.#usersService = usersService;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      const { username, password } = request.payload;
      const id = await this.#usersService.verifyUserCredential(username, password);

      const response = h.response({
        status: 'success',
        message: 'Authentication berhasil',
        data: {
          id,
        },
      });
      response.code(200);
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

  // eslint-disable-next-line class-methods-use-this
  async deleteAuthenticationHandler(request, h) {
    try {
      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    // eslint-disable-next-line no-unreachable
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
      // console.error(error);
      return response;
    }
  }
}

module.exports = AuthenticationsHandler;
