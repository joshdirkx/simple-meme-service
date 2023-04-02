import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { AccessLogFormat, LambdaIntegration, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Code, Function, Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

var path = require('path');

export class SimpleMemeServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // creates a log group for the api
    const apiLogGroup = new LogGroup(this, 'simpleMemeServiceApiLogGroup', {
      retention: RetentionDays.ONE_DAY,
    });

    // creates an s3 bucket to store images in 
    const bucket = new Bucket(this, 'simpleMemeServiceBucket', {
      versioned: false
    });

    // creates a lambda function that will respond to mentions in Slack

    // creates a lambda function that will respond to /upload and place images in S3
    const uploadImageLambda = new Function(this, 'simpleMemeServiceUploadImageLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'upload')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      logRetention: RetentionDays.ONE_DAY,
    });

    // creates a lambda function that will respond to /list and list all images in S3
    const listImagesLambda = new Function(this, 'simpleMemeServiceGetImageLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'list')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      logRetention: RetentionDays.ONE_DAY,
    });

    // creates a lambda function that will respond to /delete and remove an image from S3
    const deleteImageLambda = new Function(this, 'simpleMemeServiceDeleteImageLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'delete')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      logRetention: RetentionDays.ONE_DAY,
    });

    // allow the post image lambda function to put images in the bucket
    bucket.grantPut(uploadImageLambda);

    // allow the get image lambda function to get images from the bucket
    bucket.grantRead(listImagesLambda);

    // allow the delete image lambda function to delete images from the bucket
    bucket.grantDelete(deleteImageLambda);

    // create a new api to handle image creation, retrieval, and deletion
    const api = new RestApi(this, 'simpleMemeServiceApi', {
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(apiLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      }
    });

    // declare a new proxy lambda integration for uploading images to the s3 bucket
    const uploadImageLambdaIntegration = new LambdaIntegration(uploadImageLambda, {
      proxy: true,
    });
    
    // declare a new proxy lambda integration for retrieving images from the s3 bucket
    const listImagesLambdaIntegration = new LambdaIntegration(listImagesLambda, {
      proxy: true,
    });

    // declare a new proxy lambda integration for deleting images from the s3 bucket
    const deleteImageLambdaIntegration = new LambdaIntegration(deleteImageLambda, {
      proxy: true,
    });

    // add /images to the api
    const imagesApi = api.root.addResource('images');

    // add /images/upload to the api
    const uploadImageApi = imagesApi.addResource('upload')
    // add /images/list to the api
    const listImagesApi = imagesApi.addResource('list')
    // add /images/delete to the api
    const deleteImageApi = imagesApi.addResource('delete')

    // declare post /images/upload with the upload image lambda as the handler
    uploadImageApi.addMethod('POST', uploadImageLambdaIntegration);

    // delcares post /images/list with the get image lambda as the handler
    listImagesApi.addMethod('POST', listImagesLambdaIntegration);

    // declares post /images/delete with the delete image lambda as the handler
    deleteImageApi.addMethod('POST', deleteImageLambdaIntegration);

    new CfnOutput(this, 'simpleMemeServiceApiUrl', {
      value: api.url,
    });
  };
};
