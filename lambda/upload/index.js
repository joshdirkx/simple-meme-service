const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  try {
    console.log(event);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Image added to bucket',
        imageUrl: 'url',
      })
    }
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
