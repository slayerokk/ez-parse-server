import {Service as Database} from '@moleculer/database'
import { Errors } from 'moleculer'

export default {

    name: 'cookie',

    mixins: [
		Database({
			adapter: { 
				type: 'MongoDB',
				options: {
					uri: process.env.DATABASE,
				}
			}
		})
	],

    settings: {

		fields: {
            _id: 'string|primaryKey',
            cookie: 'string'
        }
        
    },

	actions: {

		//возвращает 1 куку из базы
		one: {
			cache: false,
			async handler(ctx) {
				const cookie = await ctx.call('cookie.find', {limit: 1, sort: '-createdAt'}, { meta: { $cache: false }})
				if (cookie.length == 0)
					throw new Errors.MoleculerError('Нет доступных кукисов', 404, 'THERE_ARE_NO_COOKIES')
				return cookie[0]
			}
		}

	}
}