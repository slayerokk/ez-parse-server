import cheerio from 'cheerio'
import {URLSearchParams} from 'url'
import axios from 'axios'
import _ from 'lodash'

export default {

	name: 'ezwow',

	settings: {
		point: 'https://ezwow.org/index.php?app=isengard&module=core&tab=armory&section=characters&realm=1&sort[key]=playtime&sort[order]=desc&st='
	},

	actions: {

		//возвращает конечное смещение из армори
		stat: {
			cache: {
				ttl: 3600
			},
			async handler(ctx) {
				//загрузить данные с сервера езвов
				const data = await ctx.call('ezwow.get')
				//создать парсер на основе данных
				const parser = cheerio.load(data)
				//спарсить ссылку на последнюю страницу
				const lastPageLink = parser('a[rel=last]').attr('href')
				//из этой ссылки выделить параметр st, указывающий на максимальное смещение
				const maxSt = Number((new URLSearchParams(lastPageLink)).get('st'))
				//посчитать количество персонажей на странице
				const charactersPerPage = parser('tr.character').length
				//спарсить количество страниц
				const pages = Number((parser('li.pagejump>a').text()).trim().split(' ').pop())
				//вернуть результат
				return {
					firstPageLink: this.settings.point, //ссылка на первую страницу
					lastPageLink, // ссылка на последнюю страницу
					maxSt, // максимальное смещение
					charactersPerPage, // количество персонажей на странице
					pages, // количество страниц
					totalCharactersLess: charactersPerPage*pages // примерное общее количество персонажей (без минуса недостающих на последней странице)
				}
			}
		},

		parse: {
			cache: {
				ttl: 3600,
				keys: ['st']
			},
			params: {
				st: 'number|min:0|convert|default:0'
			},
			async handler(ctx) {
				//загрузить данные с сервера езвов
				const data = await ctx.call('ezwow.get', ctx.params)
				//создать парсер на основе данных
				const parser = cheerio.load(data)
				const persons = []
				parser('.ipb_table tr.character').each(function() {
					const person = {}
					//race
					const raceImgSrc = parser(this).find('img.character-race').attr('src').split('/')
					const raceImgFile = raceImgSrc[raceImgSrc.length - 1]
					switch (raceImgFile) {
						case '1-0.png': person.race = 0; break
						case '1-1.png': person.race = 0; break
						case '3-0.png': person.race = 1; break
						case '3-1.png': person.race = 1; break
						case '4-0.png': person.race = 2; break
						case '4-1.png': person.race = 2; break
						case '7-0.png': person.race = 3; break
						case '7-1.png': person.race = 3; break
						case '11-1.png': person.race = 4; break
						case '11-0.png': person.race = 4; break
						case '2-0.png': person.race = 5; break
						case '2-1.png': person.race = 5; break
						case '5-0.png': person.race = 6; break
						case '5-1.png': person.race = 6; break
						case '6-0.png': person.race = 7; break
						case '6-1.png': person.race = 7; break
						case '8-0.png': person.race = 8; break
						case '8-1.png': person.race = 8; break
						case '10-0.png': person.race = 9; break
						case '10-1.png': person.race = 9; break
						default: person.race = 0; break
					}
					//class
					const classImgSrc = parser(this).find('img.character-class').attr('src').split('/')
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
					const name1 = parser(this).find('.character-name').children().first().children().first().text()
					const name2 = parser(this).children().first().children().last().text()
					person.name = name1 || name2
					//guild
					person.guild = parser(this).find('.guild-name').children().first().text()
					//login
					person.login = parser(this).find('span[itemprop="name"]').text()
					//other
					parser(this).find('td').each(function (index, element) {
						if (index == 2) person.lvl = Number(parser(element).text().trim().replace(/\s/g, ''))
						if (index == 3) person.kills = Number(parser(element).text().trim().replace(/\s/g, ''))
						if (index == 6) person.ap = Number(parser(element).text().trim().replace(/\s/g, ''))
					})
					//gs
					person.gs = Number(parser(this).find('.gearscore > .value').text().trim().replace(/\s/g, ''))
					persons.push(person)
				})
				//исключить из массива persons записи с отсутствующими данными
				const rows = _.filter(persons, person => ((person.race >= 0) && (person.class >=0) && person.name && person.login && person.lvl))
				//сгенерировать событие, что пришла новая инфа о персонажах
				await this.broker.emit('character.updated', {rows: persons})
				//вернуть результат
				return {
					rows: persons, //массив
					count: persons.length, //длина массива
					st: ctx.params.st //переданное смещение
				}
			}
		},

		//делает гет запрос к армори с указанием смещения, возвращает html страницу
		get: {
			cache: false,
			params: {
				st: 'number|min:0|default:0|convert'
			},
			async handler(ctx) {
				const {params: {st}} = ctx
				//получить 1 куку из таблицы кук
				const cookie = await ctx.call('cookie.one')
				//создать экземпляр загрузчика с этой кукой
				const loader = axios.create({
					headers: {
						'Cookie': cookie.cookie,
					},
					maxRedirects: 2
				})
				//загрузить данные с сервера езвов
				try {
					const {data} = await loader.get(`${this.settings.point}${st}`)
					return data
				} catch (error) {
					//если загрузчик упал с ошибкой 403, значит кука протухла
					if (error.response.status == 403)
						await ctx.call('cookie.remove', {id: cookie._id})
				}
			}
		}
	}
}