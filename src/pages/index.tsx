import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


import { trpc } from '~/utils/trpc';
import { messageTextSchema } from '~/common/types';


const styles = {
	width: '100vw',
	height: '100vh',
};

const schema = z.object({
	text: messageTextSchema,
});

export default function IndexPage () {
	const { register, reset, handleSubmit } = useForm<z.TypeOf<typeof schema>>({ resolver: zodResolver(schema) });

	const context = trpc.useContext();

	const { data, status } = trpc.messages.list.useQuery();
	const { mutate: post } = trpc.messages.post.useMutation({
		onSuccess: () => {
			context.messages.list.invalidate();
		}
	});

	const sendMessage = handleSubmit(({ text }) => {
		post({ type: 'plain', text });
		reset();
	});

	if (status !== 'success') return <></>;
	return (
		<div style={styles}>
			<h1>Chat</h1>
			<ul>
				{data.map(({ text: message }) => (
					<li key={message}>{message}</li>
				))}
			</ul>
			<form onSubmit={sendMessage}>
				<input {...register('text')} />
				<input type="submit" value="Post" />
			</form>
		</div>
	);
}
