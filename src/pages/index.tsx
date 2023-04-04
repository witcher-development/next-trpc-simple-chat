import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


import { trpc } from '~/utils/trpc';


const styles = {
	width: '100vw',
	height: '100vh',
};

const schema = z.object({
	message: z.string().min(1, { message: 'Required' }).max(1024),
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

	const sendMessage = handleSubmit(({ message }) => {
		post(message);
		reset();
	});

	if (status !== 'success') return <></>;
	return (
		<div style={styles}>
			<h1>Chat</h1>
			<ul>
				{data.map(({ body: message }) => (
					<li key={message}>{message}</li>
				))}
			</ul>
			<form onSubmit={sendMessage}>
				<input {...register('message')} />
				<input type="submit" value="Post" />
			</form>
		</div>
	);
}
