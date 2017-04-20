'use strict';

// Reference: https://github.com/nodemailer/nodemailer#set-up-smtp

exports.mail = {
  transportOptions: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'kf6feedback@gmail.com',
        pass: 'password or use environment variable such as process.env.EMAIL_PASSWORD'
    }
  },
  from: 'zzzz@gmail.com',
  baseURL: 'https://kf.example.net/'
};

exports.auth = {
  local: {
    caseSensitiveUsername : false // default = false
  }
};
