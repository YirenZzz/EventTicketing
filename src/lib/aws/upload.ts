// lib/aws/upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3 = new S3Client({
  region: 'us-east-2', // 替换为你创建 Bucket 的 region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImageFromUrlToS3(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);

  const extension = imageUrl.includes('.png') ? 'png' : 'jpg';
  const key = `event-covers/${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: `image/${extension}`,
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}