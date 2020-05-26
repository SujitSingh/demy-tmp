const demyConfig = {
  useMongoDB: true,
  sessionSecret: process.env.SESSION_SECRET || 'some-session-secret',
  mongoDBPath: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}`,
  serverPort: process.env.SERVER_PORT || 3300,
  emailerConfig: {
    host: 'smtp.mailtrap.io',
    port: 2525,
    user: '<username>',
    pass: '<password>'
  },
  stripe: process.env.STRIPE_KEY || '<stripe-secret-token>',
  productImgsRoot: 'public/imgs',
  invoiceFilesRoot: 'data/invoice'
};

module.exports = demyConfig;