import * as cdk from 'aws-cdk-lib';
import { CfnServiceLinkedRole } from 'aws-cdk-lib/aws-iam';
import { CcApiContextQuery, ContextProvider } from 'aws-cdk-lib/cloud-assembly-schema';
import { Construct } from 'constructs';

export interface ServiceLinkedRoleProps {
  readonly roleNamePrefix: string;
  readonly awsServiceName: string;
  readonly customSuffix?: string;
  readonly withoutCache?: boolean;
}

export class ReusableServiceLinkedRole extends cdk.Resource {
  public readonly roleName: string;
  public readonly roleArn: string;
  public readonly isNewResource: boolean;

  constructor(scope: Construct, id: string, props: ServiceLinkedRoleProps) {
    super(scope, id);

    this.roleName = props.customSuffix ? `${props.roleNamePrefix}_${props.customSuffix}` : props.roleNamePrefix;

    // arn:aws:iam::123456789012:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling_for-lookup
    this.roleArn = cdk.Stack.of(this).formatArn({
      service: 'iam',
      resource: 'role',
      region: '',
      resourceName: `aws-service-role/${props.awsServiceName}/${this.roleName}`,
    });

    this.isNewResource = !this.exists(this, this.roleName, props.withoutCache);
    if (this.isNewResource) {
      new CfnServiceLinkedRole(this, 'Resource', {
        awsServiceName: props.awsServiceName,
        customSuffix: props.customSuffix,
      });
    }
  }

  private exists(scope: Construct, roleName: string, withoutCache?: boolean): boolean {
    if (cdk.Token.isUnresolved(roleName)) {
      throw new Error('arguments for lookup must be concrete (no Tokens)');
    }

    const dummyRoleName = 'DUMMY_ROLE';

    const options: cdk.GetContextValueOptions = {
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
    };

    if (withoutCache) {
      this.reportMissingContextKey(scope, options);
    }

    const response: { [key: string]: any }[] = cdk.ContextProvider.getValue(scope, options).value;

    // getValue returns a list of result objects. We are expecting 1 result or Error.
    const lookupRoleName = response[0].RoleName;

    return lookupRoleName !== dummyRoleName;
  }

  private reportMissingContextKey(scope: Construct, options: cdk.GetContextValueOptions) {
    const { key, props } = cdk.ContextProvider.getKey(scope, options);

    const extendedProps: { [p: string]: any } = {
      dummyValue: options.dummyValue,
      ignoreErrorOnMissingContext: options.mustExist !== undefined ? !options.mustExist : undefined,
      ...props,
    };

    cdk.Stack.of(scope).reportMissingContextKey({
      key,
      provider: options.provider as ContextProvider,
      props: extendedProps as CcApiContextQuery,
    });
  }
}
