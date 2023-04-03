import { trpc } from '~/utils/trpc';


const styles = {
	width: '100vw',
	height: '100vh',
};

export default function IndexPage () {
	const context = trpc.useContext();

	const { data, status } = trpc.list.useQuery();
	const { mutate: post } = trpc.post.useMutation({
		onSuccess: () => {
			context.list.invalidate();
		}
	});

	if (status !== 'success') return <></>;
	return (
		<div style={styles}>
			<h1>Chat</h1>
			<ul>
				{data.messages.map((message) => (
					<li key={message}>{message}</li>
				))}
			</ul>
			<button onClick={() => post(`${Math.random()}`)}>Post</button>
		</div>
	);
}
