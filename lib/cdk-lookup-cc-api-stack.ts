import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ReusableServiceLinkedRole } from './reusable-service-linked-role';

export class CdkLookupCcApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const roleName = 'AWSServiceRoleForAutoScaling';
    const awsServiceName = 'autoscaling.amazonaws.com';

    new ReusableServiceLinkedRole(this, 'ExistingRole', {
      roleName,
      awsServiceName,
    });

    new ReusableServiceLinkedRole(this, 'NewRole', {
      roleName,
      awsServiceName,
      customSuffix: 'for-lookup',
    });
  }
}
