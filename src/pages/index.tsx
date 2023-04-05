import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ObjectId } from 'bson';



import { trpc } from '~/utils/trpc';
import { messageTextSchema } from '~/common/types';


const styles = {
	width: '100vw',
	height: '100vh',
};

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const schema = z.object({
	text: messageTextSchema,
	image: z
		.custom<FileList>((singleFileList) => singleFileList instanceof FileList)
		.refine((singleFileList) => singleFileList[0].size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
		.refine(
			(singleFileList) => ACCEPTED_IMAGE_TYPES.includes(singleFileList[0].type),
			'.jpg, .jpeg, .png and .webp files are accepted.'
		),
});
type FormData = z.TypeOf<typeof schema>;

const usePostMessage = () => {
	const context = trpc.useContext();
	const { mutateAsync: post } = trpc.messages.post.useMutation({
		onSuccess: () => {
			context.messages.list.invalidate();
		},
		// TODO: on error delete optimistic rows
	});

	return async ({ text, image }: FormData) => {
		if (image) {
			const optimisticID = new ObjectId().toString();
			const renamedImage = new File([image[0]], optimisticID);
			const optimisticImageURL = URL.createObjectURL(image[0]);
			context.messages.list.setData(undefined, (existingData) => [...(existingData || []), {
				id: optimisticID,
				created_at: new Date(),
				text,
				image: optimisticImageURL
			}]);
			const uploadURL = await post({ type: 'with-image', text, id: optimisticID });
			if (uploadURL) {
				await fetch(uploadURL, {
					method: 'PUT',
					body: renamedImage,
				});
			}
		} else {
			return post({ type: 'plain', text });
		}
	};
};

export default function IndexPage () {
	const {
		register,
		reset,
		handleSubmit,
		formState: { errors }
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	console.log(errors);
	const { data, status } = trpc.messages.list.useQuery();
	const post = usePostMessage();

	const sendMessage = handleSubmit(({ text, image }) => {
		post({ text, image });
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
