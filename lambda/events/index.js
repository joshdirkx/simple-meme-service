const { WebClient } = require('@slack/web-api');
const aws = require('aws-sdk');
const axios = require('axios');

const slackToken = process.env.SLACK_TOKEN;
const bucketName = process.env.BUCKET_NAME;

const s3 = new aws.S3();
const slack = new WebClient(slackToken);

exports.handler = async (event) => {
  console.log(event);

  const eventBody = JSON.parse(event.body);
  const channel = eventBody.event.channel;
  //const isUpload = eventBody.event.text.includes('upload');

  const imageUrl = eventBody.event.files[0].url_private_download;
  const fileName = eventBody.event.files[0].name;
  //const mimeType = eventBody.event.files[0].mime_type;

  //if (isUpload) {
  const imageResponse = await axios.get(imageUrl, {
    headers: {
      Authorization: `Bearer ${slackToken}`,
    },
    responseType: 'arraybuffer',
  });
  const contentType = imageResponse.headers['content-type'];
  const imageData = Buffer.from(imageResponse.data, 'binary');

  const object = await s3.putObject({
    Bucket: bucketName,
    Key: fileName,
    ContentType: contentType,
    Body: imageData,
  }).promise();

  slack.chat.postMessage({
    text: `Image uploaded: ${object.Location}`,
    channel: channel,
  });
  //};

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify('success'),
  };
};
