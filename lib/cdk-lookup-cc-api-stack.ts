import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ReusableServiceLinkedRole } from './reusable-service-linked-role';

export class CdkLookupCcApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const roleNamePrefix = 'AWSServiceRoleForAutoScaling';
    const awsServiceName = 'autoscaling.amazonaws.com';

    const existingRole = new ReusableServiceLinkedRole(this, 'ExistingRole', {
      roleNamePrefix,
      awsServiceName,
    });

    const newRole = new ReusableServiceLinkedRole(this, 'NewRole', {
      roleNamePrefix,
      awsServiceName,
      customSuffix: 'for-lookup',
    });

    new cdk.CfnOutput(this, 'ExistingRoleArn', {
      value: existingRole.roleArn,
    });
    new cdk.CfnOutput(this, 'NewRoleArn', {
      value: newRole.roleArn,
    });

    new cdk.CfnOutput(this, 'ExistingRoleIsNewResource', {
      value: existingRole.isNewResource.toString(),
    });
    new cdk.CfnOutput(this, 'NewRoleIsNewResource', {
      value: newRole.isNewResource.toString(),
    });
  }
}
