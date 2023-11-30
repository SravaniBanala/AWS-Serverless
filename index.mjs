// import simpleGit from 'simple-git';

import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import {Storage} from '@google-cloud/storage';
// import { exec } from 'child_process';
import uploadtogcs from './uploadtogcs.mjs';
import sendAssignmentSubmissionStatus from './awssnsemail.mjs';
import dynamoDBPut from './emaildatatodb.mjs';
import { URLSearchParams } from 'url';

const bucketName = process.env.BUCKETNAME;

const storage = new Storage();

const downloadRepo = async (repoUrl, destination) => {
  try 
  {
    const zipUrl = repoUrl;
    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });

    console.log(response, "is the current response");

    if (response.headers['content-type'] === 'application/zip') 
    {
      const __filename = new URL(import.meta.url).pathname;
      const __dirname = path.dirname(__filename);
      const zipFilePath = path.join('/tmp', `${destination}.zip`);
      fs.writeFileSync(zipFilePath, Buffer.from(response.data));
      console.log('Repository cloned and zipped successfully.');
      return 1;
    }
    else 
    {
      console.error(`Error downloading repository, Given URL is not pointing to ZIP. HTTP Status: ${response.status}, - having type - ${response.headers['Content-Type']}`);
      return 0;
    }
  } 
  catch (error) 
  {
    if (error.response && error.response.status === 404)
    {
      console.error(`Error downloading repository: The requested resource was not found (HTTP Status 404)`);
      return 0;
    }
    console.error(`Error downloading repository: ${error.message}`);
    return 0;
  }
};



export const handler = async (event) => 
{

  console.log(process.env.client_email, "this is my test email");

  try 
  {
    console.log("This is inside the event");
    console.log(await event);
    const Records = await event.Records[0];
    const Sns = await Records.Sns;
    const Message = await Sns.Message;
    const MessageAttributes = await Sns.MessageAttributes;
    
    console.log(MessageAttributes)
    
    const submissionURL = await MessageAttributes.submission_url.Value
    const submittedUserEmail = await MessageAttributes.user_email.Value
    const submittedassignmentID = await MessageAttributes.assignmentID.Value
    const submissionID = await MessageAttributes.submissionID.Value
    const assignmentName = await MessageAttributes.assignment_Name.Value
    const assignmentCount = await MessageAttributes.submissionCount.Value
    
    console.log(await submissionURL,"this is url",await submittedUserEmail, "This is email", await submittedassignmentID, await submissionID);

    const downloadStatus = await downloadRepo(submissionURL, submittedassignmentID)

    var url;
    var uploadStatus = 0;

    if (downloadStatus === 1)
    {
      const submittedBucketName = `${assignmentName}/${submittedUserEmail}/submissionCount-${assignmentCount}.zip`;

      console.log(bucketName, "uploading bucket name");

      [uploadStatus, url] = await uploadtogcs(bucketName,`/tmp/${submittedassignmentID}.zip`, submittedBucketName);
      if (uploadStatus === 1)
      {
        console.log("Successfully uploaded to GCP");
        await sendAssignmentSubmissionStatus(submittedUserEmail, assignmentName, downloadStatus, uploadStatus, url, submittedBucketName);
      }
      else
      {
        console.log("Failed Upload to GCP");
        await sendAssignmentSubmissionStatus(submittedUserEmail, assignmentName, downloadStatus, uploadStatus, submissionURL); 
      }
    }
    else
    {
      console.log("Failed to download the zip from the given URL with unproper email");
      await sendAssignmentSubmissionStatus(submittedUserEmail, assignmentName, downloadStatus, uploadStatus, submissionURL);
    }

    console.log("Started pushing to DynamoDB");

    const dynamoDBData = {
      uniqueId: { S : uuidv4() },
      submittedassignmentid: { S : submittedassignmentID }, 
      downloadurl: { S : url[0] ? url[0] : "NULL" },
      submittedurl: { S : submissionURL }
    };

    console.log(dynamoDBData,"This is dynamo DB Data");

    try 
    {
      await dynamoDBPut(dynamoDBData);
      console.log('Successfully added data to dynamoDB');
      console.log("here is the email sent");
    }
    catch(error)
    {
      console.log("error adding into the dynamodb");
      return {statusCode: 500,body: "Error DynamoDB Issue"};
    }
    return {statusCode: 200,body: "Successfully Executed Lambda Function"};
  } 
  catch (error) 
  {
    console.error('Error:', error.message);
    return {statusCode: 500,body: `Error processing SNS message ${error}`};
  }
};