import gateway from 'moleculer-web'
import database from '../models'

export default {

	name: 'web',

	mixins: [gateway],

	settings: {

		port: 44235,

		server: true,

		cors: {
			origin: '*',
		},

		routes: [{
			path: '/api',
			aliases: {
				'POST /parser/cookie': 'parser.cookie',
				'GET /parser/stats': 'parser.stats'
			},
			bodyParsers: {
				json: true,
				urlencoded: { extended: true }
			},
			mappingPolicy: 'restrict'
		}],

		onError(req, res, err) {
			const error = {
				error: {
					code: err.code || 500,
					message: err.message || 'Unknown error'
				}
			}
			if (err.data && Array.isArray(err.data)) {
				error.error.data = err.data.map(dataElement => {
					const element = dataElement
					delete element.actual
					delete element.nodeID
					delete element.action
					return element
				})
			} else {
				error.error.data = err.data
			}
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(error.error.code)
			res.end(JSON.stringify(error))
		}
		
	},

	async started() {
		await database.sequelize.sync(/*{force: true}*/)
	}

}