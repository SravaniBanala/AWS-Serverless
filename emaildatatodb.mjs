import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini'; // Import fromIni for reading AWS credentials from AWS CLI configuration


import dotenv from 'dotenv';
dotenv.config();

// const awsProfile = process.env.AWS_PROFILE

// const credentialProvider = fromIni({ profile: awsProfile });


const tableName = process.env.DYNAMODBTABLENAME

const dynamoDBRegion = process.env.REGION

const dynamoDbClient = new DynamoDBClient({ region: dynamoDBRegion });

// const dynamoDbClient = new DynamoDBClient({ region: dynamoDBRegion});

const insertItemToDynamoDB = async (itemData) => {

  console.log("this is in the dynamodb file with data", itemData);

  const params = {
    TableName: tableName,
    Item: itemData,
  };

  try 
  {
    console.log("trying to upload the data to dynamo db with the data params", params)
    const command = new PutItemCommand(params);

    console.log("generating the command for the put data", command);

    await dynamoDbClient.send(command);

    console.log("dynamodb send client to database success");

    console.log('Item inserted successfully.');
  } 
  catch (error) 
  {
    console.error('Error inserting item:', error);
    throw error;
  }
};



// const Item =  
// {
//   emailid: { S : 'new@gmail.com' },
//   submittedassignmentid: { S: '8b05148a-6f57-4ce7-8034-2894ac664a01'},
//   downloadurl: { S : 'https://storage.googleapis.com/assignmentstore-1701208995925/8b05148a-6f57-4ce7-8034-2894ac664a01-new%40gmail.com.zip?GoogleAccessId=lambdaserviceaccount%40development-406305.iam.gserviceaccount.com&Expires=1741478400&Signature=K3gKc%2FoGsi%2BvSHtVz2yhrn%2BbZqSQwZ%2FOhopeKdVdt2c3jhnqxl6c3b4wf3dJPa3dnagl%2BIuNj1tOg9xszbWy6RBsnNjvM6w1vRoFmdcc2Shy%2FOyiFMqgzL6enUBmYenS3RgCNneZNMAlr7gzoaTch7h9D%2BHmWUtc5SKYK0Imqkmr0rTVp92vm4Cr0QwDpEEwZ7SPlEhD8mfhmhBIlWYgD6%2FmoEkby3jQkqQg81%2BMmfFZEXLI2PDoT7CWEcQz4SBK16x6u1PCDjQCsdIPdS5YSfTt6kovY2nXlnYM5BH3ZOdHquVKb2y9tCvuRTnawoks4HuSc7S6lE5MmYmsQU2uEw%3D%3D' },
//   submittedurl: { S : 'https://rb.gy/ws6vb9' }
// }


// insertItemToDynamoDB(Item);



export default insertItemToDynamoDB;


