#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkLookupCcApiStack } from '../lib/cdk-lookup-cc-api-stack';

const app = new cdk.App();
new CdkLookupCcApiStack(app, 'CdkLookupCcApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
