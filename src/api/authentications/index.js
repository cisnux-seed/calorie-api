const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    usersService,
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      usersService,
    );
    server.route(routes(authenticationsHandler));
  },
};
