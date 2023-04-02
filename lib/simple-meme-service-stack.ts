import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Code, Function, Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

var path = require('path');

export class SimpleMemeServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // creates a bucket in which images will be stored
    const bucket = new Bucket(this, 'simpleMemeServiceBucket', {
      versioned: false
    });

    // creates a lambda function that will place images in the bucket
    const uploadImageLambda = new Function(this, 'simpleMemeServiceImageUploadLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'upload')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      }
    });

    // creates a lambda function that will get images from the bucket
    const getImageLambda = new Function(this, 'simpleMemeServiceGetImageLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'upload')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      }
    });

    // allow the lambda function to put images in the bucket
    bucket.grantPut(uploadImageLambda);

    // create a new api
    const api = new RestApi(this, 'simpleMemeServiceApi');

    // add /images to the api
    const imagesApi = api.root.addResource('images');

    // declare a new proxy lambda integration for uploading images to the s3 bucket
    const uploadImageLambdaIntegration = new LambdaIntegration(uploadImageLambda, {
      proxy: true,
    });
    
    // declare a new proxy lambda integration for retrieving images from the s3 bucket
    const getImageLambdaIntegration = new LambdaIntegration(getImageLambda, {
      proxy: true,
    });

    // declare post /images with the upload image lambda as the handler
    imagesApi.addMethod('POST', uploadImageLambdaIntegration);
    // delcares get /images with the get image lambda as the handler
    imagesApi.addMethod('GET', getImageLambdaIntegration);

    new CfnOutput(this, 'simpleMemeServiceApiUrl', {
      value: api.url,
    });
  };
};
