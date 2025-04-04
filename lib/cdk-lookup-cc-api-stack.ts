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

    // You can use these properties.
    existingRole.roleArn;
    existingRoleWithoutCache.roleName;
    newRole.isNewResource;
  }
}
