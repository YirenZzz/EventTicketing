import AWS from 'aws-sdk';
import axios from 'axios';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION || 'us-east-2',
});

export async function uploadImageFromURLToS3(imageUrl: string, key: string): Promise<string | null> {
  try {
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data, 'binary');

    const upload = await s3.upload({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }).promise();

    return upload.Location; // 返回公开可访问的 URL
  } catch (err) {
    console.error('S3 upload failed:', err);
    return null;
  }
}