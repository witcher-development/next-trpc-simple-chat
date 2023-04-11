import React from 'react';
import { Badge, Flex } from '@mantine/core';

import { Message } from '~/components/home/model';
import { getMapOfUniqueFormattedDates } from '~/components/home/utils';


type Props = {
	messages: Message[],
	currentMessageDate: Date,
}
export const DayBadge = ({ messages, currentMessageDate }: Props) => {
	const formattedDates = getMapOfUniqueFormattedDates(messages);
	if (!formattedDates.includes(currentMessageDate)) return null;
	return (
		<Flex justify="center" align="center" w="100%">
			<Badge>
				<time>{formattedDates.get(currentMessageDate)}</time>
			</Badge>
		</Flex>
	);
};
