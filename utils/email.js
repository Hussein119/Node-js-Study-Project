const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = async (options) => {
  // 1) create a transporter

  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option
  });

  // 2) Define the email options

  const mailOption = {
    form: 'Hussein <hussein@io.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  // 3) Actually send the email

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;

/*
When using Nodemailer, the `service` option depends on the email service provider you are using. Here are some popular email service providers along with their respective service names that you can use as the `service` option:

1. Gmail:
   - Service: `'Gmail'`
   - Example: `service: 'Gmail'`

2. Outlook.com / Hotmail.com:
   - Service: `'Outlook'`
   - Example: `service: 'Outlook'`

3. Yahoo Mail:
   - Service: `'Yahoo'`
   - Example: `service: 'Yahoo'`

4. Office 365:
   - Service: `'Office365'`
   - Example: `service: 'Office365'`

5. SendGrid:
   - Service: `'SendGrid'`
   - Example: `service: 'SendGrid'`

6. Mailgun:
   - Service: `'Mailgun'`
   - Example: `service: 'Mailgun'`

These are just a few examples, and there are many more email service providers you can use with Nodemailer. Choose the appropriate service name based on the email service you are using. Additionally, make sure you have the necessary credentials (username and password) for the chosen email service provider.

Note: Some email service providers may require additional configuration, such as setting up an application-specific password or enabling specific settings in your email account. Please refer to the documentation of your email service provider for more information on how to set up SMTP access and obtain the required credentials.

*/
