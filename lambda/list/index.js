const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucketName = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  console.log(event);

  try {
    const objectsList = s3.listObjectsV2({
      Bucket: bucketName,
    });
    
    const imageKeys = objectsList.Contents
      .filter(object => /\.(jpg|jpeg|png|gif)$/i.test(object.Key))
      .map(object => object.Key);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: imageKeys
      })
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
