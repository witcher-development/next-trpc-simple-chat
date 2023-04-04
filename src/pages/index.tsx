import { trpc } from '~/utils/trpc';


const styles = {
	width: '100vw',
	height: '100vh',
};

export default function IndexPage () {
	const context = trpc.useContext();

	const { data, status } = trpc.messages.list.useQuery();
	const { mutate: post } = trpc.messages.post.useMutation({
		onSuccess: () => {
			context.messages.list.invalidate();
		}
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
			<button onClick={() => post(`${Math.random()}`)}>Post</button>
		</div>
	);
}
