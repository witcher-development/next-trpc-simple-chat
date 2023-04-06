import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


const REGION = 'eu-central-1';
const S3 = new S3Client({
	region: REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY as string,
		secretAccessKey: process.env.S3_SECRET_KEY as string,
	},
});

const objectInfo = (filename: string) => ({
	Bucket: process.env.S3_BUCKET as string,
	Key: filename,
});

export const getFileUploadUrl = async (filename: string) => {
	const putCommand = new PutObjectCommand(objectInfo(filename));
	return await getSignedUrl(S3, putCommand, { expiresIn: 100 });
};
export const deleteFile = (filename: string) => {
	const deleteCommand = new DeleteObjectCommand(objectInfo(filename));
	S3.send(deleteCommand);
};


export const constructImageUrl = (imageName: string) =>
	`https://${process.env.S3_BUCKET}.s3.${REGION}.amazonaws.com/${imageName}`;
