import axios from 'axios'
import database from '../models'
import cheerio from 'cheerio'
import fs from 'fs'
import queue from 'moleculer-bull'

const DATAPAGE = 'https://ezwow.org/index.php?app=isengard&module=core&tab=armory&section=characters&realm=1&sort[key]=playtime&sort[order]=desc&st='

const PARSER_DELAY = 120 // задержка между парсингами, сек, не влияет, только информативно
const PARSER_ENDS = 150000 // конечная позиция смещения
const PARSER_CRON = '*/2 * * * *' // крон очереди парсинга
const LUA_CRON = '* */12 * * *' // крон очереди генерации LUA
const EXTEND_STAT_TTL = 43200 // кеш подсчета количества рас и классов
const STAT_TTL = 180 // кеш подсчета статистики



export default {

	name: 'parser',

	mixins: [queue(process.env.CACHER)],

	queues: {
		
		async 'generate.lua'() {
			this.logger.info('Generating IsengradArmory.lua....')
			const [rows] = await database.sequelize.query('select * from Chars', {raw: true})
			this.logger.info('Found chars for LUA', rows.length)
			const file = fs.createWriteStream('IsengardArmory.lua')
			file.write('EZ_DATABASE = {\n')
			let counter = 0
			let border = Math.round(rows.length/2)
			rows.forEach(row => {
				if (counter == border) {
					file.write('} \nEZ_DATABASE2 = {\n')
				}
				file.write(`{a="${row.login}",n="${row.name}",l=${row.lvl},s=${row.gs},r=${row.race},g="${row.guild}",c=${row.class}},\n`)
				counter++
			})
			file.write('}\n')
			file.write(`SLASH_EZARMORY1, SLASH_EZARMORY2 = '/ar', '/armory';

			EZ_BLACKING = 0;
			EZ_FRIENDING = 0;
			EZ_INVITING = 0;
			EZ_RECRUITING = 0;
		
			EZ_COLORS = {
			  [0] = "ffabd473", --Hunter (Охотник)-
			  [1] = "ff8788ee", --Warlock (Колдун)-
			  [2] = "ffffffff", --Priest (Жрец)-
			  [3] = "fff58cba", --Paladin (Паладин)-
			  [4] = "ff3fc7eb", --Mage (Маг)-
			  [5] = "fffff569", --Rogue (Вор)-
			  [6] = "ffff7d0a", --Druid (Друид)-
			  [7] = "ff0070de", --Shaman (Шаман)-
			  [8] = "ffc79c6e", --Warrior (Воин)-
			  [9] = "ffc41f3b", --Death knight (Рыцарь смерти)-
			  
			  [10] = "4ec0fffe", --captions
			  [11] = "ffc41f3b", --horde
			  [12] = "ff3fc7eb", --alliance
			  [13] = "00ff96ff"  --guild
			};
			
			EZ_RACES = {
			  [0] = "Человек",
			  [1] = "Дворф",
			  [2] = "НайтЭльф",
			  [3] = "Гномик",
			  [4] = "Дреней", 
			  [5] = "Орк", 
			  [6] = "Нежить",
			  [7] = "Таурен",
			  [8] = "Тролль",
			  [9] = "Блудэльф",
			};
			
			EZ_SORTED = {};
			
			local function tablelength(T)
			  local count = 0
			  for i,v in ipairs(T) do count = count + 1 end
			  return count
			end
			
			local EZ_COUNT = tablelength(EZ_DATABASE)+tablelength(EZ_DATABASE2);
			
			local function EZWrapColor(text, index)
				return ("|c%s%s|r"):format(EZ_COLORS[index], text);
			end
			
			local function EZWrapRace(character, raceindex)
			if raceindex>=5 then
				return EZWrapColor(EZ_RACES[raceindex], 11);
			else
				return EZWrapColor(EZ_RACES[raceindex], 12);
			end
			end
			
			local function EZWrapGuild(guild)
				if guild == "" then return "" else
				return EZWrapColor("<"..guild..">", 10)
				end
			end
			
			local function EZWrapAccount(accname)
				return EZWrapColor("<"..accname..">", 10)
			end
			
			local function EZWrapNameHyperlink(text, index)
				return ("|Hplayer:%s|h%s|h"):format(text, EZWrapColor(text, index));
			end
			
			local function EZWrapBlackHyperlink(accname)
				return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ЧС]"), 11);
			end
			
			local function EZWrapFriendHyperlink(accname)
				return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ДР]"), 12);
			end
			
			local function EZWrapRecruitHyperlink(accname)
				return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в ГИ]"), 13);
			end
			
			local function EZWrapInviteHyperlink(accname)
				return EZWrapColor(("|Hplayer:%s|h%s|h"):format(accname, "[Всех в РЕ]"), 12);
			end
			
			local function EZOutput(character, classindex, lvl, raceindex, score, guild)
				print(EZWrapColor("["..lvl.."] ", 12)..EZWrapNameHyperlink(character, classindex).." "..EZWrapColor(score.." GS", 10).." "..EZWrapRace(character, raceindex).." "..EZWrapGuild(guild));
			end
			
			local function EZOutputGi(character, classindex, lvl, raceindex, score, accname)
				print(EZWrapColor("["..lvl.."] ", 12)..EZWrapNameHyperlink(character, classindex).." "..EZWrapColor(score.." GS", 10).." "..EZWrapRace(character, raceindex).." "..EZWrapAccount(accname));
			end
			
			local function EZOutputArray(characters, foundedacc)
			local counter = 0;
			print(" ");
			print(EZWrapColor("Все персонажи аккаунта "..EZWrapColor(foundedacc, 3), 10));
			print(" ");
			for i, v in ipairs(characters) do
				EZOutput(v.n, v.c, v.l, v.r, v.s, v.g);
				counter = counter +1;
			end
			print(" ");
			print(EZWrapColor("Найдено "..EZWrapColor(counter, 3).." персонажей ", 10));
			print(EZWrapBlackHyperlink(foundedacc).." "..EZWrapFriendHyperlink(foundedacc).." "..EZWrapRecruitHyperlink(foundedacc).." "..EZWrapInviteHyperlink(foundedacc));
			print(" ");
			print(" ");
			print(" ");
			end
			
			local function EZOutputArrayGi(characters, foundedgi)
			local counter = 0;
			print(" ");
			print(EZWrapColor("Все персонажи гильдии <"..EZWrapColor(foundedgi, 3)..">", 10));
			print(" ");
			for i, v in ipairs(characters) do
				EZOutputGi(v.n, v.c, v.l, v.r, v.s, v.a);
				counter = counter +1;
			end
			print(" ");
			print(EZWrapColor("В гильдии "..EZWrapColor(counter, 3).." персонажей ", 10));
			print(EZWrapBlackHyperlink(foundedgi).." "..EZWrapFriendHyperlink(foundedgi)..EZWrapInviteHyperlink(foundedgi));
			print(" ");
			print(" ");
			print(" ");
			end
			
			local function handler(msg, editbox)
			
			EZ_BLACKING = 0;
			EZ_FRIENDING = 0;
			EZ_RECRUITING = 0;
			EZ_INVITING = 0;
			
			local foundedacc = nil;
			local foundedgi = nil;
			
			print(" ");
			print(" ");
			print(" ");
			print(EZWrapColor("EZWoW.org Оружейная 1.6, (с) Border", 10));
			print(EZWrapColor("База от ` + (new Date).toLocaleString() +`, содержит "..EZWrapColor(EZ_COUNT, 3).." персонажей.", 10));
			
			for i, v in ipairs(EZ_DATABASE) do
				if (strlower(v.n) == strlower(msg)) then
					foundedacc = v.a;
					break;
				end
			end
			
			if foundedacc == nil then
				for i, v in ipairs(EZ_DATABASE2) do
					if (strlower(v.n) == strlower(msg)) then
						foundedacc = v.a;
						break;
					end
				end
			end
			
			if foundedacc == nil then
				print(EZWrapColor("Ничего не найдено =(.", 10));
			end
			
			if foundedgi ~= nil then
				EZ_SORTED = {};
				local counter = 0;
				for i, v in ipairs(EZ_DATABASE) do
					if v.g == foundedgi then
						table.insert(EZ_SORTED, v);
					end
					counter = counter + 1;
				end
				for i, v in ipairs(EZ_DATABASE2) do
					if v.a == foundedgi then
						table.insert(EZ_SORTED, v);
					end
					counter = counter + 1;
				end
				sort(EZ_SORTED, function(a, b) return a.s>b.s end)
				EZOutputArrayGi(EZ_SORTED, foundedgi);
			end
			
			if foundedacc ~= nil then
				EZ_SORTED = {};
				local counter = 0;
				for i, v in ipairs(EZ_DATABASE) do
					if v.a == foundedacc then
						table.insert(EZ_SORTED, v);
					end
					counter = counter + 1;
				end
				for i, v in ipairs(EZ_DATABASE2) do
					if v.a == foundedacc then
						table.insert(EZ_SORTED, v);
					end
					counter = counter + 1;
				end
				sort(EZ_SORTED, function(a, b) return a.s>b.s end)
				EZOutputArray(EZ_SORTED, foundedacc);
			end
			
			end
			
			SlashCmdList["EZARMORY"] = handler;
			
			local f = CreateFrame("Frame");
			function f:onUpdate(sinceLastUpdate)
				self.sinceLastUpdate = (self.sinceLastUpdate or 0) + sinceLastUpdate;
				if ( self.sinceLastUpdate >= 1 ) then 
					if tablelength(EZ_SORTED) == 0 then
						EZ_BLACKING = 0;
						EZ_FRIENDING = 0;
						EZ_RECRUITING = 0;
						EZ_INVITING = 0;
						f:SetScript("OnUpdate", nil)
					end
					for i,v in ipairs(EZ_SORTED) do
						if EZ_BLACKING == 1 then
							AddIgnore(v.n);
						end
						if EZ_FRIENDING == 1 then
							AddFriend(v.n);
						end
						if EZ_RECRUITING == 1 then
							GuildInvite(v.n);
						end
						if EZ_INVITING == 1 then
							InviteUnit(v.n);
						end
						table.remove(EZ_SORTED, i)
						break;
					end
					self.sinceLastUpdate = 0;
				end
			end
			
			local OldSetItemRef = SetItemRef 
			
			function SetItemRef(link, text, button) 
				local blackposition = strfind(text, "ЧС");
				local friendposition = strfind(text, "ДР");
				local giposition = strfind(text, "ГИ");
				local reposition = strfind(text, "РЕ");
				if blackposition ~= nil then
					EZ_BLACKING = 1;
					f:SetScript("OnUpdate",f.onUpdate)
				elseif friendposition ~= nil then 
					EZ_FRIENDING = 1;
					f:SetScript("OnUpdate",f.onUpdate)
				elseif giposition ~= nil then 
					EZ_RECRUITING = 1;
					f:SetScript("OnUpdate",f.onUpdate)
				elseif reposition ~= nil then 
					EZ_INVITING = 1;
					f:SetScript("OnUpdate",f.onUpdate)
				else
					OldSetItemRef(link, text, button) 
				end 
			end `)
			file.end()
			this.logger.info('Generating LUA complete')
		},

		async 'parse.page'() {
			const cookie = await database.Cookie.findOne()
			if (cookie) {
				let data
				let ax = axios.create({
					headers: {
						'Cookie': cookie.cookie,
					},
					maxRedirects: 100
				})
				const start =  (await this.broker.cacher.get('start.point')) || 0
				if (start > PARSER_ENDS) {
					await this.broker.cacher.set('start.point', 0)
					return
				}
				this.logger.info('Try to load data from ', start)
				try {
					data = (await ax.get(DATAPAGE + start)).data
				} catch (error) {
					if (error.response && error.response.status === 403) {
						this.logger.info('Bad cookie, remove')
						await cookie.destroy()
						return
					}
				}
				await this.broker.cacher.set('start.point', start + 20 )
				const $ = cheerio.load(data)
				const persons = []
				$('.ipb_table tr.character').each(function() {
					const person = {}
					//race
					const raceImgSrc = $(this).find('img.character-race').attr('src').split('/')
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
				this.logger.info('Parsed characters: ', persons.length)
				await database.Char.bulkCreate(persons, {
					updateOnDuplicate: ['race', 'class', 'guild', 'login', 'lvl', 'kills', 'gs', 'ap']
				})
				return
			} else {
				this.logger.info('No cookies lost')
			}
		}

	},

	actions: {

		cookie: {
			params: {
				cookie: 'string'
			},
			async handler(ctx) {
				const cookie = database.Cookie.build({
					cookie: ctx.params.cookie
				})
				await cookie.save()
			}
		},

		extended: {
			cache: {
				ttl: EXTEND_STAT_TTL
			},
			async handler() {
				const [[races], [classes]] = await Promise.all([
					database.sequelize.query('select race, count(race) as count from Chars group by race', {raw: true}),
					database.sequelize.query('select class, count(class) as count from Chars group by class', {raw: true})
				])
				return {
					races: races,
					classes: classes
				}
			}
		},

		stats: {
			cache: {
				ttl: STAT_TTL
			},
			async handler() {
				const [cookies, parsed, cursor, extended] = await Promise.all([
					database.Cookie.count(),
					database.Char.count(),
					this.broker.cacher.get('start.point'),
					this.broker.call('parser.extended')
				])
				return {
					cursor: cursor || 0,
					cursor_ends: PARSER_ENDS,
					parsed: parsed,
					cookies: cookies,
					delay: PARSER_DELAY,
					...extended
				}
			}
		},

		lua: {
			handler(ctx) {
				ctx.meta.$responseType = 'application/octet-stream'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': 'attachment; filename="IsengardArmory.lua"'
				}
				return fs.createReadStream('IsengardArmory.lua')
			}
		}

	},

	async started() {
		await Promise.all([
			this.createJob('generate.lua', {}, { delay: 10000 }),
			this.createJob('generate.lua', {}, { repeat: { cron: LUA_CRON } }),
			this.createJob('parse.page', {}, { repeat: { cron: PARSER_CRON } })
		])
	}
}