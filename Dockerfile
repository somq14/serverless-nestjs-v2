FROM node:16-slim AS base
WORKDIR /work
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache
ENV YARN_ENABLE_MIRROR=false

RUN apt-get update && apt-get install -y git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY .yarn .yarn
COPY .yarnrc.yml package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/infra/package.json packages/infra/
RUN --mount=type=cache,target=/tmp/yarn-cache \
  yarn install --immutable
COPY ./ ./

FROM base AS build-api
RUN yarn workspace backend run build api-aws-lambda

FROM public.ecr.aws/lambda/nodejs:16.2022.09.09.11 AS api
COPY --from=build-api /work/packages/backend/dist/apps/api/aws-lambda-handler.js ${LAMBDA_TASK_ROOT}
CMD [ "aws-lambda-handler.handler" ]
