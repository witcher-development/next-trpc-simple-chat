import { DeepPartial } from '@trpc/server';
import { ObjectId } from 'bson';

import { RouterInputs, RouterOutputs } from '~/server/api/root';


type Message = RouterOutputs['messages']['list']['messages'][number]
export const getNewMessage = (data: DeepPartial<Message>): Message => Object.assign({
	id: new ObjectId().toString(),
	createdAt: new Date(),
	text: null,
	image: null
}, data);

export type Sort = RouterInputs['messages']['list']['sort']
