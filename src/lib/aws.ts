import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: "us-east-2", // my AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadCoverImageFromURL(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const key = `covers/${uuidv4()}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: "image/jpeg",
      ACL: "public-read",
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}
