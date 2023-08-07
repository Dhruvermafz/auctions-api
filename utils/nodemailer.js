const nodemailer = require("nodemailer");

exports.sendEmail = function (email, subject, text, htmlContent) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: subject,
    text: text,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
};
