import axios from 'axios'
import _ from 'lodash'
import cron from 'node-cron'
import database from '../models'
import cheerio from 'cheerio'
import queue from 'moleculer-bull'

const DATAPAGE = 'https://ezwow.org/index.php?app=isengard&module=core&tab=armory&section=characters&realm=1&sort%5Bkey%5D=playtime&st='

export default {

	name: 'parser',

	mixins: [queue(process.env.CACHER)],

	settings: {
		start: 0
	},

	queues: {
		async 'db.upsert' (job) {
			await database.Char.upsert(job.data)
		}
	},

	actions: {

		exec: {
			params: {
				cookie: 'string'
			},
			async handler() {
                
			}
		}

	},

	methods: {

		async parse() {
			const cookie = await database.Cookie.findOne()
			if (cookie) {
				let data
				let ax = axios.create({
					headers: {
						'Cookie': cookie.cookie,
					},
					maxRedirects: 50
				})
				this.logger.info('Try to load data, start = ', this.settings.start)
				try {
					data = (await ax.get(DATAPAGE + this.settings.start)).data
				} catch (error) {
					this.logger.info('Bad cookie, remove')
					await cookie.destroy()
					return
				}
				this.settings.start = (this.settings.start > 150000)? 0: this.settings.start + 20
				const $ = cheerio.load(data)
				const persons = []
				$('.ipb_table tr.character').each(function() {
					const person = {}
					//race
					const raceImgSrc = $(this).find('img.character-race').attr('src').split('/')
					const raceImgFile = raceImgSrc[raceImgSrc.length - 1]
					switch (raceImgFile) {
					case '1-0.png': person.race = 0; break
					case '3-0.png': person.race = 1; break
					case '4-1.png': person.race = 2; break
					case '7-0.png': person.race = 3; break
					case '11-1.png': person.race = 4; break
					case '2-0.png': person.race = 5; break
					case '5-0.png': person.race = 6; break
					case '6-1.png': person.race = 7; break
					case '8-0.png': person.race = 8; break
					case '10-0.png': person.race = 9; break
					default: person.race = 0; break
					}
					//class
					const classImgSrc = $(this).find('img.character-class').attr('src').split('/')
					const classImgFile = classImgSrc[classImgSrc.length - 1]
					switch (classImgFile) {
					case '3.png': person.class = 0; break
					case '9.png': person.class = 1; break
					case '5.png': person.class = 2; break
					case '2.png': person.class = 3; break
					case '8.png': person.class = 4; break
					case '4.png': person.class = 5; break
					case '11.png': person.class = 6; break
					case '7.png': person.class = 7; break
					case '1.png': person.class = 8; break
					case '6.png': person.class = 9; break
					default: person.class = 0; break
					}
					//name
					const name1 = $(this).find('.character-name').children().first().children().first().text()
					const name2 = $(this).children().first().children().last().text()
					person.name = name1 || name2
					//guild
					person.guild = $(this).find('.guild-name').children().first().text()
					//login
					person.login = $(this).find('span[itemprop="name"]').text()
					//other
					$(this).find('td').each(function (index, element) {
						if (index == 2) person.lvl = $(element).text().trim().replace(/\s/g, '')
						if (index == 3) person.kills = $(element).text().trim().replace(/\s/g, '')
						if (index == 6) person.ap = $(element).text().trim().replace(/\s/g, '')
					})
					//gs
					person.gs = $(this).find('.gearscore > .value').text().trim().replace(/\s/g, '')
					persons.push(person)
				})
				this.logger.info('Parsed characters: ', persons)
				await Promise.all(
					_.map(persons, person => this.createJob('db.upsert', person, { attempts: 2, backoff: 10*1000 }))
				)
				return
			} else {
				this.logger.info('No cookies lost')
			}
		}

	},

	started() {
		cron.schedule('*/30 * * * * *', this.parse)
	}
}