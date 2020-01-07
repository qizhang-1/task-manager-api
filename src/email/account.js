const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'cfc7001@gmail.com', 
        subject: 'Thanks for joining us.',
        text: `Welcome to our app, ${name}.   Let me know how you get along with the app. `
    })      
}


const sendCancellation = (email, name) => {
    sgMail.send({
        to: email,
        from: 'cfc7001@gmail.com', 
        subject: 'Sorry to hear that.',
        text: `${name}, we are really sorry to you've decided to cancel your account.  Let me know how to keep your business. `
    })      
}

module.exports = {
    sendWelcomeEmail, sendCancellation
}