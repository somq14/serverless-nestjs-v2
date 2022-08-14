import { RequestListener } from "http";

import { NestFactory } from "@nestjs/core";
import serverlessExpress from "@vendia/serverless-express";
import { Handler } from "aws-lambda";

import { AppModule } from "./app.module";

const bootstrap = async (): Promise<Handler> => {
  const app = await NestFactory.create(AppModule);
  await app.init();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expressApp: RequestListener = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
};

const server = bootstrap();
export const handler: Handler = async (event, context, callback) => {
  return (await server)(event, context, callback);
};
