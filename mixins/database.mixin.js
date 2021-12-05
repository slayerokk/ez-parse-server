import {Service as Database} from '@moleculer/database'

export default function () {

    return {

		mixins: [
			Database({
				adapter: 'NeDB',
				maxLimit: 10
			})
		]

	}

}