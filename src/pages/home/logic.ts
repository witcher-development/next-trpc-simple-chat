import { trpc } from '~/utils/trpc';
import { getNewMessage } from '~/pages/home/model';

import { renameFile, uploadImageToS3 } from './utils';

import { ChatInputData } from './index';


const useOptimisticallyAddMessage = () => {
	const context = trpc.useContext();
	return async (optimisticMessage: ReturnType<typeof getNewMessage>) => {
		await context.messages.list.cancel();
		context.messages.list.setData(undefined, (existingData) => [...(existingData || []), optimisticMessage]);
	};
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

export const useDeleteMessage = () => {
	const context = trpc.useContext();
	const { mutate: deleteMessage } = trpc.messages.delete.useMutation({
		onMutate: async ({ id }) => {
			await context.messages.list.cancel();
			const backupMessage = context.messages.list.getData()?.find((m) => m.id === id);
			// TODO: use correct error constructor
			if (!backupMessage) throw new Error('Attempt to delete non-existing message');

			context.messages.list.setData(undefined, (messages) => messages?.filter((m) => m.id !== id));

			return { backupMessage };
		},
		onError: (_error, _vars, backup) => {
			if (!backup?.backupMessage) throw new Error('Backup message lost');
			// doesn't matter at which location I put it back, because UI will be sorted.
			context.messages.list.setData(undefined, (messages) => [...(messages || []), backup.backupMessage]);
		}
	});
	return deleteMessage;
};
