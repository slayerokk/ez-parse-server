import {Service as Database} from '@moleculer/database'
import path from 'path'

export default function (collection) {

    return {

		mixins: [
			Database({
				adapter: {
					type: 'NeDB',
					options: path.resolve(__dirname, `../database/${collection}.json`)
				}
			})
		]

	}

}