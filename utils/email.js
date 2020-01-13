const nodemailer = require('nodemailer');
const demyConfig = require('./config');

// register link
const mailer = nodemailer.createTransport({
  host: demyConfig.emailerConfig.host,
  port: demyConfig.emailerConfig.port,
  auth: {
    user: demyConfig.emailerConfig.user,
    pass: demyConfig.emailerConfig.pass
  }
});

exports.sendEmail = (email) => {
  return mailer.sendMail({
    to: email.to,
    from: email.from,
    subject: email.subject,
    text: email.text,
    html: email.html
  }).then(result => {
    console.log(result);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));
    return result;
  });
}