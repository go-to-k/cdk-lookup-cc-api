import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ReusableServiceLinkedRole } from './reusable-service-linked-role';

export class CdkLookupCcApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const existingRole = new ReusableServiceLinkedRole(this, 'ExistingRole', {
      roleNamePrefix: 'AWSServiceRoleForAutoScaling',
      awsServiceName: 'autoscaling.amazonaws.com',
    });

    const existingRoleWithoutCache = new ReusableServiceLinkedRole(this, 'ExistingRoleWithoutCache', {
      roleNamePrefix: 'AWSServiceRoleForElasticLoadBalancing',
      awsServiceName: 'elasticloadbalancing.amazonaws.com',
      withoutCache: true,
    });

    const newRole = new ReusableServiceLinkedRole(this, 'NewRole', {
      roleNamePrefix: 'AWSServiceRoleForAutoScaling',
      awsServiceName: 'autoscaling.amazonaws.com',
      customSuffix: 'for-lookup',
    });

    new cdk.CfnOutput(this, 'ExistingRoleArn', {
      value: existingRole.roleArn,
    });
    new cdk.CfnOutput(this, 'ExistingRoleWithoutCacheArn', {
      value: existingRoleWithoutCache.roleArn,
    });
    new cdk.CfnOutput(this, 'NewRoleArn', {
      value: newRole.roleArn,
    });

    new cdk.CfnOutput(this, 'ExistingRoleIsNewResource', {
      value: existingRole.isNewResource.toString(),
    });
    new cdk.CfnOutput(this, 'ExistingRoleWithoutCacheIsNewResource', {
      value: existingRoleWithoutCache.isNewResource.toString(),
    });
    new cdk.CfnOutput(this, 'NewRoleIsNewResource', {
      value: newRole.isNewResource.toString(),
    });
  }
}
