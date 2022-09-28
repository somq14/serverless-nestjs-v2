import * as cdk from "aws-cdk-lib";
import { BundlingOutput, Stack } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const stack = Stack.of(this);

    const handler = new lambda.Function(this, "handler2", {
      runtime: lambda.Runtime.FROM_IMAGE,
      handler: lambda.Handler.FROM_IMAGE,
      code: lambda.Code.fromAssetImage(
        path.resolve(__dirname, "..", "..", ".."),
        { target: "api" }
      ),
      memorySize: 512,
    });

    const api = new apigateway.RestApi(this, `${stack.stackName}-apigateway`, {
      deployOptions: {
        stageName: "v1",
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
      },
    });

    const integration = new apigateway.LambdaIntegration(handler, {});
    api.root.addMethod("ANY", integration, {});
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }
}
