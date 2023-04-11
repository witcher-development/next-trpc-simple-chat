import React from 'react';
import { Button, Flex, rem } from '@mantine/core';
import { IconArrowNarrowDown, IconArrowNarrowUp, IconCalendar, IconLetterT } from '@tabler/icons-react';

import * as model from '~/components/home/model';


const componentsSize = 'xs';
const iconsSize = 20;

type Props = {
	sort: model.Sort
	setSort: (sort: model.Sort) => void;
}
export const Sort = ({ sort, setSort }: Props) => {
	const toggleSort = (field: model.Sort['field']) => setSort({
		field,
		order: sort.order === 'asc' ? 'desc' : 'asc'
	});

	return (
		<Flex>
			<Button
				onClick={() => toggleSort('text')}
				size={componentsSize}
				variant="outline"
				sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
			>
				<IconLetterT size={rem(iconsSize)} />
				{ sort.field === 'text' && sort.order === 'asc' && <IconArrowNarrowUp size={rem(iconsSize)} /> }
				{ sort.field === 'text' && sort.order === 'desc' && <IconArrowNarrowDown size={rem(iconsSize)} /> }
			</Button>
			<Button
				onClick={() => toggleSort('createdAt')}
				size={componentsSize}
				variant="outline"
				sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 0 }}
			>
				<IconCalendar size={rem(20)} />
				{ sort.field === 'createdAt' && sort.order === 'asc' && <IconArrowNarrowUp size={rem(iconsSize)} /> }
				{ sort.field === 'createdAt' && sort.order === 'desc' && <IconArrowNarrowDown size={rem(iconsSize)} /> }
			</Button>
		</Flex>
	);
};
