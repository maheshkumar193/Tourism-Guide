const nodemailer = require('nodemailer')

const sendMail = async (options) => {
  //1.Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //2.Define email options
  const mailOptions = {
    from: 'maheshbodhan19@gmail.com',
    to: options.mail,
    subject: options.subject,
    text: options.text
    //html:
  }

  //3.send the mail
  await transporter.sendMail(mailOptions)
}

module.exports = sendMail
