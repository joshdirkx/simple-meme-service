const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  console.log(event);

  try {
    const object = s3.getObject({
      Bucket: bucketName,
      Key: event.pathParameters.imageKey
    });
    
    const image = object.Body.toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Encoding': 'base64',
      },
      body: image,
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  };
};
