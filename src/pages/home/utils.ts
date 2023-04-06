import { z } from 'zod';


const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imageSchema = z
	.custom<FileList>((value) => value instanceof FileList)
	.superRefine((singleFileList, ctx) => {
		if (singleFileList.length === 0) return z.NEVER;
		if (singleFileList.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Max 1 image',
			});
			return z.NEVER;
		}

		if (singleFileList[0].size > MAX_FILE_SIZE) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Max file size is 5MB',
			});
		}
		if (!ACCEPTED_IMAGE_TYPES.includes(singleFileList[0].type)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Max file size is 5MB',
			});
		}
	})
	.transform((singleFileList) => singleFileList[0]);

export const renameFile = (file: File, newName: string) => new File([file], newName);

export const uploadImageToS3 = (image: File, url: string) => {
	fetch(url, {
		method: 'PUT',
		body: image,
	});
};
