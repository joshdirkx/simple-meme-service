# Simple Meme Service

## Supplying the funny, on demand

![She's an icon, she's a legend and she IS the moment](assets/image.gif)

Simple Meme Service is Slack bot written using cloud native, serverless technologies. It is capable of uploading, retrieving, and deleting images on command from within your Slack workspace.

### Getting Started

#### Requirements

- AWS Cloud Development Kit (CDK) installed
- Slack workspace
- AWS account

#### Creating the Slack app

- Update the values in slack/app-manifest.json as appropriate
- Create a new Slack app from the contents of slack/app-manifest.json

#### Deploying the Infrastructure

- Obtain credentials to your AWS account
- Run `AWS_REGION=<desired_region> cdk deploy --parameters slackToken=<slack_token>`, replacing `<desired_region>` with the AWS Region of your choice and `<slack_token>` with your Slack application's Bot User OAuth Token

#### Authorizing the Event Subscriptions Request URL

```javascript
exports.handler = function (event, context, callback) {
  console.log(event);

  const eventBody = JSON.parse(event.body);
  const challengeAnswer = eventBody.challenge;

  const body = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
     challengeAnswer
    ),
  };

  return callback(null, body);
};
```

### Usage Instructions

#### Uploading a Meme

#### Deleting a Meme

#### Listing all Memes

#### Showing a Meme
