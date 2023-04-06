import { trpc } from '~/utils/trpc';
import { getNewMessage } from '~/pages/home/model';

import { renameFile, uploadImageToS3 } from './utils';

import { ChatInputData } from './index';


export const usePostMessage = () => {
	const context = trpc.useContext();
	// TODO: on error delete optimistic rows
	const { mutateAsync: post } = trpc.messages.post.useMutation();

	return async (data: ChatInputData) => {
		if (data.image) {
			const { image: imageList, text } = data;
			// need to extract image from FileList here or it will be lost after 'await'
			const image = imageList[0];

			// optimistically add message to chat
			const optimisticMessage = getNewMessage({
				text,
				image: URL.createObjectURL(image)
			});
			context.messages.list.setData(undefined, (existingData) => [...(existingData || []), optimisticMessage]);

			const uploadURL = await post({ type: 'with-image', text, id: optimisticMessage.id });
			if (uploadURL) uploadImageToS3(renameFile(image, optimisticMessage.id), uploadURL);
		} else {
			return post({ type: 'plain', text: data.text });
		}
	};
};
