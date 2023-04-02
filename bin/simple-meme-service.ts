#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleMemeServiceStack } from '../lib/simple-meme-service-stack';

const app = new cdk.App();

new SimpleMemeServiceStack(app, 'SimpleMemeServiceStack', {
 env: {
    account: process.env.AWS_ACCOUNT_ID, 
    region: process.env.AWS_REGION,
  },
});
