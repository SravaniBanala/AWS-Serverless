import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const smtpUser = process.env.SMTPUSER;
const smtpPassword = process.env.SMTPPASSWORD;
const smtpHost = process.env.SMTPHOST;
const senderEmail = process.env.SENDEREMAIL;
const smtpPort = process.env.SMTPPORT;


const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

async function sendAssignmentSubmissionStatus(toEmail, assignmentName, downloadStatus, uploadStatus, url, filePath = null) {

  let emailSubject;
  let emailBody;
  console.log("email properties",toEmail,assignmentName,downloadStatus,uploadStatus,url);
  // console.log(isValidZipURL,"Is current zip url status");

    console.log("I am proper zip email")


  if (downloadStatus === 1 && uploadStatus === 1)
  {
    emailSubject = 'Assignment Submission Status Successful';
    console.log("email stratus",1);
    emailBody = `Assignment ${assignmentName} has been submitted successfully, stored in Google Cloud Storage download with File Name - ${filePath}`;
  }
  else
  {
    if (downloadStatus === 1)
    {
      emailSubject = 'Assignment Submission Status Failure';
      emailBody = `Assignment : ${assignmentName} Downloaded Successfully \nFailed to upload to GCP contact Admin`;
    }
    else
    {
      emailSubject = 'Assignment Submission Status Failure';
      emailBody = `Assignment : ${assignmentName} Submission Failed \nPlease enter proper URL`;
    }
  }

  const ccEmailListString = process.env.CCEMAILLIST;

  const ccEmailList = JSON.parse(ccEmailListString);

  const formattedCcList = ccEmailList.map(email => `"${email}"`).join(', ');
  console.log("email ",senderEmail,toEmail,formattedCcList);

  console.log("This is transporter",transporter);

  const info = await transporter.sendMail({
    from: senderEmail,
    to: toEmail,
    cc: formattedCcList,
    subject: emailSubject,
    text: emailBody,
  });
  console.log(info);
  console.log(`Message sent to: ${toEmail}, messageId - ${info.messageId}.`);
}

export default sendAssignmentSubmissionStatus;