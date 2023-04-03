import { CfnOutput, CfnParameter, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AccessLogFormat, CfnGatewayResponse, LambdaIntegration, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Code, Function, Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

var path = require('path');

export class SimpleMemeServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const slackToken = new CfnParameter(this, 'slackToken', {
      type: 'String',
      description: 'Token for your Slack application',
    });

    // creates a log group for the api
    const apiLogGroup = new LogGroup(this, 'simpleMemeServiceApiLogGroup', {
      retention: RetentionDays.ONE_DAY,
    });

    // creates an s3 bucket to store images in 
    const bucket = new Bucket(this, 'simpleMemeServiceBucket', {
      versioned: false,
      publicReadAccess: true,
    });

    // creates a lambda function that will respond to mentions in Slack
    const eventsLambda = new Function(this, 'simpleMemeServiceEventsLambda', {
      code: Code.fromAssetImage(path.join(__dirname, '..', 'lambda', 'events')),
      handler: Handler.FROM_IMAGE,
      runtime: Runtime.FROM_IMAGE,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.ONE_DAY,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        SLACK_TOKEN: slackToken.valueAsString,
      },
    });

    // allow the events lambda to upload, retrieve, and delete images
    bucket.grantPut(eventsLambda);
    bucket.grantRead(eventsLambda);
    bucket.grantDelete(eventsLambda);

    // create a new api to handle image creation, retrieval, and deletion
    const api = new RestApi(this, 'simpleMemeServiceApi', {
      defaultIntegration: new LambdaIntegration(eventsLambda, {
        proxy: true,
        timeout: Duration.millis(50),
      }),
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(apiLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      }
    });

    // set a default response after timeout from api gateway
    new CfnGatewayResponse(this, 'defaultResponse', {
      restApiId: api.restApiId,
      responseType: 'INTEGRATION_TIMEOUT',
      statusCode: '200',
      responseTemplates: {
        'application/json': JSON.stringify({ message: 'message received' }),
      },
    });

    // add /events to the api
    const eventsResource = api.root.addResource('events');

    // declares post /events/ with the events lambda as the handler
    //eventsResource.addMethod('POST', eventsLambdaIntegration);
    eventsResource.addMethod('POST');

    // output the url of the api to the console when deploying
    new CfnOutput(this, 'simpleMemeServiceApiUrl', {
      value: api.url,
    });
  };
};
