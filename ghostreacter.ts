import * as cdk from "aws-cdk-lib";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";

const SLACK_TOKEN = process.env.SLACK_TOKEN!;
const MY_MEMBER_ID = process.env.MY_MEMBER_ID!;
const CHANNEL_NAME = process.env.CHANNEL_NAME!;
const REACTION_NAMES = process.env.REACTION_NAMES!;
const REACTION_THRESHOLD = process.env.REACTION_THRESHOLD!;

const app = new cdk.App();
const stack = new cdk.Stack(app, "Ghostreacter");

const handler = new lambdaNodejs.NodejsFunction(stack, "LambdaFunction", {
  runtime: lambda.Runtime.NODEJS_LATEST,
  environment: {
    SLACK_TOKEN,
    MY_MEMBER_ID,
    CHANNEL_NAME,
    REACTION_NAMES,
    REACTION_THRESHOLD,
  },
});

new events.Rule(stack, "ScheduledRule", {
  schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
  targets: [new eventsTargets.LambdaFunction(handler)],
});
