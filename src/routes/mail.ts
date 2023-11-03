const nodemailer = require("nodemailer");

interface SendMailType {
  email: string;
  firstName: string;
  lastName: string;
  isNewUser: boolean;
}

export const sendMail = async ({
  email,
  firstName,
  lastName,
  isNewUser,
}: SendMailType) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SENDINBLUE,
        pass: process.env.PSSWD_SENDINBLUE,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: isNewUser
        ? "Welcome to Honey !"
        : "Goodbye, we're already missing you !",
      text: isNewUser
        ? `Hello ${firstName} ${lastName.toUpperCase()}, welcome to Honey !`
        : "You're leaving us to soon ! You're account has been deleted successfully",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    return err;
  }
};

// This example is for Typescript-node

var SibApiV3Sdk = require("sib-api-v3-typescript");

var apiInstance = new SibApiV3Sdk.SMTPApi();

// Configure API key authorization: api-key

var apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = "YOUR API KEY";

// Configure API key authorization: partner-key

// var partnerKey = apiInstance.authentications['partnerKey'];
// partnerKey.apiKey = "YOUR API KEY"

// var sendSmtpEmail = {
// 	to: [{
// 		email: 'testmail@example.com',
// 		name: 'John Doe'
// 	}],
// 	templateId: 59,
// 	params: {
// 		name: 'John',
// 		surname: 'Doe'
// 	},
// 	headers: {
// 		'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
// 	}
// };

// apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
//   console.log('API called successfully. Returned data: ' + data);
// }, function(error) {
//   console.error(error);
// });
