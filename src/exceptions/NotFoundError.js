const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  // 400 bad request
  // 401 unauthorized
  // 404 not found
  // 403 forbidden
  // 500 internal server error
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
