import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

let client: SNSClient | null = null;

function getClient(): SNSClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }
  if (!client) {
    client = new SNSClient({ region: process.env.AWS_REGION ?? "us-east-1" });
  }
  return client;
}

/**
 * Sends an SMS to the given E.164 phone number.
 * Silently skips if AWS credentials are not configured (local dev).
 */
export async function sendSms(phoneNumber: string, message: string): Promise<void> {
  const sns = getClient();
  if (!sns) {
    console.log(`[SMS skipped — no AWS creds] To: ${phoneNumber} | ${message}`);
    return;
  }
  try {
    await sns.send(
      new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": { DataType: "String", StringValue: "Transactional" },
        },
      })
    );
  } catch (err) {
    console.error(`[SMS failed] To: ${phoneNumber}`, err);
  }
}
