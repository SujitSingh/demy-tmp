const demyConfig = {
  useMongoDB: true,
  sessionSecret: 'some-session-secret',
  mongoDBPath: 'mongodb://root:passw0rd@localhost:27017/demy_nosql',
  emailerConfig: {
    host: 'smtp.mailtrap.io',
    port: 2525,
    user: '<username>',
    pass: '<password>'
  }
};

module.exports = demyConfig;