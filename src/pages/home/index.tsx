import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { trpc } from '~/utils/trpc';
import { messageTextSchema } from '~/common/types';

import { imageSchema } from './utils';
import { usePostMessage } from './logic';


const styles = {
	width: '100vw',
	height: '100vh',
};


const chatInputSchema = z.object({
	text: messageTextSchema,
	image: imageSchema.optional()
});
export type ChatInputData = z.TypeOf<typeof chatInputSchema>;

export default function HomePage () {
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors }
	} = useForm<ChatInputData>({ resolver: zodResolver(chatInputSchema) });

	const { data, status } = trpc.messages.list.useQuery();
	const post = usePostMessage();

	const sendMessage = handleSubmit((data) => {
		post(data);
		reset();
	});

	if (status !== 'success') return <></>;
	return (
		<div style={styles}>
			<h1>Chat</h1>
			<ul>
				{data.map(({ id, text, image }) => (
					<li key={id}>
						{text && <p>{ text }</p>}
						{image && <img src={image} alt="image" width={200} />}
					</li>
				))}
			</ul>
			<form onSubmit={sendMessage}>
				<input type="file" {...register('image')} />
				<input {...register('text')} />
				<input type="submit" value="Post" />
			</form>
		</div>
	);
}
