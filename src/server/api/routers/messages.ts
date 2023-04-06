import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import * as process from 'process';

import { publicProcedure, router } from '~/server/api/trpc';
import { messageTextSchema } from '~/common/types';


const REGION = 'eu-central-1';
const S3 = new S3Client({
	region: REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY as string,
		secretAccessKey: process.env.S3_SECRET_KEY as string,
	},
});
const getUploadUrl = async (filename: string) => {
	const putCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET as string,
		Key: filename,
	});
	return await getSignedUrl(S3, putCommand, { expiresIn: 100 });
};
const constructImageUrl = (imageName: string) =>
	`https://${process.env.S3_BUCKET}.s3.${REGION}.amazonaws.com/${imageName}`;

const postMessageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('plain'),
		text: messageTextSchema,
		id: z.string(),
	}),
	z.object({
		type: z.literal('with-image'),
		text: messageTextSchema,
		id: z.string(),
	})
]);

export const MessagesRouter = router({
	list: publicProcedure
		.query(({ ctx }) => ctx.prisma.message.findMany()),
	post: publicProcedure
		.input(postMessageSchema)
		.mutation(async ({ input, ctx }) => {
			switch (input.type) {
				case 'plain': {
					await ctx.prisma.message.create({
						data: {
							id: input.id,
							text: input.text,
						}
					});
					return;
				}
				case 'with-image': {
					await ctx.prisma.message.create({
						data: {
							id: input.id,
							text: input.text,
							image: constructImageUrl(input.id)
						}
					});
					return await getUploadUrl(input.id);
				}
				default: {
					throw new Error('should not happen');
				}
			}
		}),
});
