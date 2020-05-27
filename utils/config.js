const demyConfig = {
  useMongoDB: true,
  sessionSecret: process.env.SESSION_SECRET || 'some-session-secret',
  mongoDBPath: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}`,
  serverPort: process.env.PORT || 3300,
  emailerConfig: {
    host: process.env.SMPT_HOST,
    port: 2525,
    user: process.env.SMPT_USER,
    pass: process.env.SMTP_PASS
  },
  stripe: process.env.STRIPE_KEY,
  productImgsRoot: 'public/imgs',
  invoiceFilesRoot: 'data/invoice'
};

module.exports = demyConfig;