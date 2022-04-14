import queue from 'moleculer-bull'

export default {

    name: 'pulser',

    mixins: [
		queue(process.env.CACHER)
    ],

	queues: {
		async 'pulser.pulse'() {
			try {
				//загрузить максимальное смещение (кеш 1 час)
				const stat = await this.broker.call('ezwow.stat')
				//получить из кеша сервера позицию смещения, либо 0
				let st = (await this.broker.cacher.get('start.point')) || 0
				//если позиция смещения в кеше больше максимального смещения, обнулить ее
				if (st > stat.maxSt)
					st = 0
				//загрузить данные персонажей по смещению st, экшн также внесет их в БД
				await this.broker.call('ezwow.parse', {st})
				//увеличить смещение
				st += 20
				//записать новое смещение в кеш
				await this.broker.cacher.set('start.point', st)
			} catch (e) {
			}
			//вернуть завершенный промис
			return Promise.resolve()
		}
	},

	actions: {

		position: {
			cache: false,
			async handler(ctx) {
				return {
					position: (await this.broker.cacher.get('start.point')) || 0
				}
			}
		}
	},

	started() {
		return this.createJob('pulser.pulse', {}, {
			delay: 20000, //задержка выполнения на 20 сек, чтобы все сервисы стартанули
			removeOnComplete: true, //удалить задание из очереди если завершено
			repeat: { //повторяющееся задание
				every: (process.env.PULSER || 30) * 1000 // повторять каждые 30 секунд
			}
		})
	}

}