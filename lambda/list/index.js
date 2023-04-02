const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  console.log(event);

  try {
    const objects = await s3.listObjectsV2({
      Bucket: bucketName,
    }).promise();

    const imageUrls = objects.Contents.map(
      (object) => `https://${bucketName}.s3.amazonaws.com/${object.Key}`
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageUrls)
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
