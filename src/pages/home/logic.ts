import { trpc } from '~/utils/trpc';
import { getNewMessage } from '~/pages/home/model';

import { renameFile, uploadImageToS3 } from './utils';

import { ChatInputData } from './index';


const useOptimisticallyAddMessage = () => {
	const context = trpc.useContext();
	return (optimisticMessage: ReturnType<typeof getNewMessage>) =>
		context.messages.list.setData(undefined, (existingData) => [...(existingData || []), optimisticMessage]);
};

export const usePostMessage = () => {
	// TODO: on error delete optimistic rows
	const { mutateAsync: post } = trpc.messages.post.useMutation();
	const optimisticallyAddMessage = useOptimisticallyAddMessage();


	return async (data: ChatInputData) => {
		if (data.image) {
			const { image, text } = data;

			const optimisticMessage = getNewMessage({
				text,
				image: URL.createObjectURL(image)
			});
			optimisticallyAddMessage(optimisticMessage);

			const uploadURL = await post({ type: 'with-image', text, id: optimisticMessage.id });
			if (uploadURL) uploadImageToS3(renameFile(image, optimisticMessage.id), uploadURL);
		} else {
			const optimisticMessage = getNewMessage({
				text: data.text,
			});
			optimisticallyAddMessage(optimisticMessage);

			return post({ type: 'plain', text: data.text, id: optimisticMessage.id });
		}
	};
};
