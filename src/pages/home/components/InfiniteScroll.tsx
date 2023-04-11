import React, { PropsWithChildren } from 'react';
import $InfiniteScroll, { Props as $Props } from 'react-infinite-scroll-component';


type Props = PropsWithChildren<Pick<$Props, 'next' | 'hasMore' | 'dataLength'>>
export const InfiniteScroll = ({ next, hasMore, dataLength, children }: Props) => (
	<$InfiniteScroll
		next={next}
		hasMore={hasMore}
		loader={<h4>Loading...</h4>}
		dataLength={dataLength}
		// allows showing delete button when message takes full width
		style={{ overflow: 'visible' }}
	>
		{children}
	</$InfiniteScroll>
);
