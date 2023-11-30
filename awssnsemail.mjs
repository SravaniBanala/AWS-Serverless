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

  // console.log(isValidZipURL,"Is current zip url status");

    console.log("I am proper zip email")


  if (downloadStatus === 1 && uploadStatus === 1)
  {
    emailSubject = 'Assignment Submission Status Successful';
    emailBody = `Assignment ${assignmentName} has been submitted successfully, stored in Google Cloud Storage download from this URL - ${url} with File Name - ${filePath}`;
  }
  else
  {
    if (downloadStatus === 1)
    {
      emailSubject = 'Assignment Submission Status Failure';
      emailBody = `Assignment : ${assignmentName} Downloaded Successfully Failed to upload to GCP contact Admin`;
    }
    else
    {
      emailSubject = 'Assignment Submission Status Failure';
      emailBody = `Assignment : ${assignmentName} Submission Failed enter proper url, invalid submitted url - ${url}`;
    }
  }

  const ccEmailListString = process.env.CCEMAILLIST;

  const ccEmailList = JSON.parse(ccEmailListString);

  const formattedCcList = ccEmailList.map(email => `"${email}"`).join(', ');

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