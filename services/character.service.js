import {Service as Database} from '@moleculer/database'
import { Errors } from 'moleculer'

export default {

    name: 'character',

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
            login: 'string|max:256',
			name: 'string|max:256',
            guild: 'string|max:256',
            class: 'number',
            race: 'number',
            lvl: 'number',
            kills: 'number',
            gs: 'number',
            ap: 'number',
			updated: {
				type: 'number',
				onCreate: () => Date.now(),
				onUpdate: () => Date.now()
			}
        }  
    },

	actions: {

		updateOrCreate: {
			cache: false,
			params: {
				login: 'string|max:256',
				name: 'string|max:256',
				guild: 'string|max:256',
				class: 'number',
				race: 'number',
				lvl: 'number',
				kills: 'number',
				gs: 'number',
				ap: 'number',
				$$strict: 'remove'
			},
			async handler(ctx) {
				const {params} = ctx
				const {login, name} = params
				if (!login || !name)
					throw new Errors.MoleculerError('Нет имени или логина', 404, 'LOGIN_AND_NAME_REQUIRED')
				//найти персонажа по логину и имени
				const characters = await ctx.call('character.find', {query: {login, name}, limit: 1})
				if (characters.length) 
					//персонаж найден, обновить
					return ctx.call('character.update', {...ctx.params, _id: characters[0]._id})
				else
					return ctx.call('character.create', ctx.params)
			}
		},

		races: {
			handler(ctx) {
				return Promise.all([
					ctx.call('character.count', {query: {race: 0}}),
					ctx.call('character.count', {query: {race: 1}}),
					ctx.call('character.count', {query: {race: 2}}),
					ctx.call('character.count', {query: {race: 3}}),
					ctx.call('character.count', {query: {race: 4}}),
					ctx.call('character.count', {query: {race: 5}}),
					ctx.call('character.count', {query: {race: 6}}),
					ctx.call('character.count', {query: {race: 7}}),
					ctx.call('character.count', {query: {race: 8}}),
					ctx.call('character.count', {query: {race: 9}})
				])
			}
		},

		classes: {
			handler(ctx) {
				return Promise.all([
					ctx.call('character.count', {query: {class: 0}}),
					ctx.call('character.count', {query: {class: 1}}),
					ctx.call('character.count', {query: {class: 2}}),
					ctx.call('character.count', {query: {class: 3}}),
					ctx.call('character.count', {query: {class: 4}}),
					ctx.call('character.count', {query: {class: 5}}),
					ctx.call('character.count', {query: {class: 6}}),
					ctx.call('character.count', {query: {class: 7}}),
					ctx.call('character.count', {query: {class: 8}}),
					ctx.call('character.count', {query: {class: 9}})
				])
			}
		}
	}
}