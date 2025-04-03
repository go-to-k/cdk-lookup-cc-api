import * as cdk from 'aws-cdk-lib';
import { CfnServiceLinkedRole } from 'aws-cdk-lib/aws-iam';
import { CcApiContextQuery, ContextProvider } from 'aws-cdk-lib/cloud-assembly-schema';
import { Construct } from 'constructs';

export interface ServiceLinkedRoleProps {
  roleName: string;
  awsServiceName: string;
  customSuffix?: string;
}

export class ReusableServiceLinkedRole extends cdk.Resource {
  public readonly resource?: CfnServiceLinkedRole;

  constructor(scope: Construct, id: string, props: ServiceLinkedRoleProps) {
    super(scope, id);

    const lookupRoleName = props.customSuffix
      ? `${props.roleName}_${props.customSuffix}`
      : props.roleName;

    if (!this.exists(this, lookupRoleName)) {
      this.resource = new CfnServiceLinkedRole(this, 'Resource', {
        awsServiceName: props.awsServiceName,
        customSuffix: props.customSuffix,
      });
    }
  }

  private exists(scope: Construct, roleName: string): boolean {
    if (cdk.Token.isUnresolved(roleName)) {
      throw new Error('arguments for lookup must be concrete (no Tokens)');
    }

    const dummyRoleName = 'DUMMY_ROLE';

    const response: { [key: string]: any }[] = cdk.ContextProvider.getValue(scope, {
      provider: ContextProvider.CC_API_PROVIDER,
      props: {
        typeName: 'AWS::IAM::ServiceLinkedRole',
        exactIdentifier: roleName,
        propertiesToReturn: ['RoleName'],
      } as CcApiContextQuery,
      dummyValue: [
        {
          RoleName: dummyRoleName,
        },
      ],
      mustExist: false,
    }).value;

    // getValue returns a list of result objects. We are expecting 1 result or Error.
    const lookupRoleName = response[0].RoleName;

    return lookupRoleName !== dummyRoleName;
  }
}
