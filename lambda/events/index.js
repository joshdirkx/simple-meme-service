const { WebClient } = require('@slack/web-api');
const aws = require('aws-sdk');
const axios = require('axios');

const slackToken = process.env.SLACK_TOKEN;
const bucketName = process.env.BUCKET_NAME;
const awsRegion = process.env.AWS_REGION;

const s3 = new aws.S3();
const slack = new WebClient(slackToken);

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const regex = new RegExp(`\\.(${imageExtensions.join('|')})$`, 'i');

exports.handler = async (event) => {
  console.log(event);

  const eventBody = JSON.parse(event.body);
  const channel = eventBody.event.channel;

  const isUpload = eventBody.event.text.includes('upload');
  const isList = eventBody.event.text.includes('list');
  const isDelete = eventBody.event.text.includes('delete');
  const isPost = eventBody.event.text.includes('post');

  var text = null;

  if (isUpload) {
    const imageDownloadUrl = eventBody.event.files[0].url_private_download;
    const fileName = eventBody.event.files[0].name;

    const imageResponse = await axios.get(imageDownloadUrl, {
      headers: {
        Authorization: `Bearer ${slackToken}`,
      },
      responseType: 'arraybuffer',
    });
    const contentType = imageResponse.headers['content-type'];
    const imageData = Buffer.from(imageResponse.data, 'binary');

    await s3.putObject({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
      Body: imageData,
    }).promise();
    
    text = `Uploaded ${fileName} to S3`;
  };

  if (isList) {
    const objects = await s3.listObjectsV2({
      Bucket: bucketName,
    }).promise();

    console.log(objects);

    const availableImages = objects.Contents.map((object) => object.Key).join('\n');

    text = `${availableImages}`
  };

  if (isDelete) {
    const fileNames = eventBody.event.text.split(' ').filter(string => regex.test(string));
    
    console.log(fileNames);

    await fileNames.forEach((fileName) => {
      s3.deleteObject({
        Bucket: bucketName,
        Key: fileName,
      });
    }).promise();

    text = `Deleted ${fileNames.join(',')} from S3`;
  };

  if (isPost) {
    const fileName = eventBody.event.text.split(' ').find(string => regex.test(string));

    const imageUrl = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${fileName}`

    await slack.chat.postMessage({
      channel: channel,
      blocks: [
        {
          type: 'image',
          image_url: imageUrl,
          alt_text: 'meme',
        }
      ]
    }).promise();
  };

  if (!isPost) {
    await slack.chat.postMessage({
      text: text,
      channel: channel,
    }).promise();
  };
};
