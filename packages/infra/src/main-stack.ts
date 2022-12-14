import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const stack = Stack.of(this);

    const handler = new lambda.Function(this, "handler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "..", "..", "backend", "dist", "apps", "api")
      ),
      handler: "aws-lambda-handler.handler",
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
