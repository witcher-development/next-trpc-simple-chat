import { Stack, Skeleton } from '@mantine/core';


export const ChatSkeleton = () => (
	<Stack align="start">
		<Skeleton height={20} radius="xl" sx={{ alignSelf: 'center' }} width={62} />
		<Skeleton height={40} radius="md" width={150} />
		<Skeleton height={300} radius="md" width={300} />
		<Skeleton height={40} radius="md" width={400} />
		<Skeleton height={40} radius="md" width={350} />

		<Skeleton height={20} radius="xl" sx={{ alignSelf: 'center' }} width={62} />
		<Skeleton height={40} radius="md" width={200} />
		<Skeleton height={40} radius="md" width={70} />
		<Skeleton height={300} radius="md" width={300} />
	</Stack>
);
