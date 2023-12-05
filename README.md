# Serverless Code for GitHub Release Download and Email Notification

This Lambda function is triggered by an SNS notification and is responsible for:

## Trigger
SNS notification triggers the Lambda function.

## Functionality
* GitHub Release Download:
Downloads the release from the GitHub repository.

* Google Cloud Storage Upload:
Stores the release in the specified GCS Bucket.

* Email Notification:
Sends an email to the user with the download status.

* Email Tracking in DynamoDB:
Records sent email details in DynamoDB.

* Command to Import Certificate 
aws acm import-certificate --certificate file://certificate_base64.txt --certificate-chain file://ca_bundle_base64.txt --private-key file://private_base64.txt --profile sbanalademo --region us-east-1