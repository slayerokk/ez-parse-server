import {Readable} from 'stream'
import path from 'path'
import { promises as fs } from 'fs'
import _ from 'lodash'
import Zip from 'adm-zip'

export default {

    name: 'generator',

    actions: {

        json: {
            params: {
                filename: 'string|max:256|optional|default:IsengardArmory.json'
            },
            async handler(ctx) {
                ctx.meta.$responseType = 'application/json'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': `attachment; filename="${ctx.params.filename}"`
				}
                const data = await ctx.call('character.find')
                const stream = new Readable()
                stream.push(JSON.stringify({characters: data}))
                stream.push(null)
				return stream
            }
        },

        sql: {
            params: {
                filename: 'string|max:256|optional|default:IsengardArmory.sql'
            },
            async handler(ctx) {
                ctx.meta.$responseType = 'application/sql'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': `attachment; filename="${ctx.params.filename}"`
				}
                const characters = await ctx.call('character.find')
                const stream = new Readable()
                stream.push(this.SQLTemplate({characters}))
                stream.push(null)
				return stream
            }
        },

        sqlzip: {
            params: {
                filename: 'string|max:256|optional|default:IsengardArmory.sql.zip'
            },
            async handler(ctx) {
                ctx.meta.$responseType = 'application/zip'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': `attachment; filename="${ctx.params.filename}"`
				}
                const characters = await ctx.call('character.find')
                const zip = new Zip()
                zip.addFile('IsengardArmory.sql', Buffer.from(this.SQLTemplate({characters}), 'utf8'))
                return zip.toBuffer()
            }
        },

        toc: {
            params: {
                filename: 'string|max:256|optional|default:IsengardArmory.toc'
            },
            async handler(ctx) {
                ctx.meta.$responseType = 'application/octet-stream'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': `attachment; filename="${ctx.params.filename}"`
				}
                const stream = new Readable()
                stream.push(this.TOCTemplate())
                stream.push(null)
				return stream
            }
        },

        addon: {
            async handler(ctx) {
                ctx.meta.$responseType = 'application/zip'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': `attachment; filename="IsengardArmory.zip"`
				}
                const characters = await ctx.call('character.find', {sort: 'login'})
                //сортировка по аккаунту
                const sorted = []
                let login = ''
                let persons = []
                _.map(characters, character => {
                    if (character.login == login)
                        persons.push(character)
                    else {
                        if (persons.length) {
                            sorted.push({
                                login,
                                persons
                            })
                            persons = [] 
                        }
                        login = character.login
                        persons.push(character)
                    }
                })
                if (persons.length) {
                    sorted.push({
                        login,
                        persons
                    })
                }
                const zip = new Zip()
                zip.addFile('IsengardArmory/IsengardArmory.lua', Buffer.from(this.LUATemplate({
                    sorted,
                    date: new Date().toLocaleString('ru'),
                    accounts: sorted.length,
                    characters: characters.length 
                }), 'utf8'))
                zip.addFile('IsengardArmory/IsengardArmory.toc', Buffer.from(this.TOCTemplate(), 'utf8'))
                return zip.toBuffer()
            }
        },

        lua: {
            params: {
                filename: 'string|max:256|optional|default:IsengardArmory.lua'
            },
            async handler(ctx) {
                ctx.meta.$responseType = 'application/octet-stream'
				ctx.meta.$responseHeaders = {
					'Content-Disposition': 'attachment; filename="IsengardArmory.lua"'
				}
                const characters = await ctx.call('character.find', {sort: 'login'})
                //сортировка по аккаунту
                const sorted = []
                let login = ''
                let persons = []
                _.map(characters, character => {
                    if (character.login == login)
                        persons.push(character)
                    else {
                        if (persons.length) {
                            sorted.push({
                                login,
                                persons
                            })
                            persons = [] 
                        }
                        login = character.login
                        persons.push(character)
                    }
                })
                if (persons.length) {
                    sorted.push({
                        login,
                        persons
                    })
                }
                const stream = new Readable()
                stream.push(this.LUATemplate({
                    sorted,
                    date: new Date().toLocaleString('ru'),
                    accounts: sorted.length,
                    characters: characters.length 
                }))
                stream.push(null)
				return stream
            }
        }

    },

    async started() {
        this.SQLTemplate = _.template(Buffer.from(await fs.readFile(path.resolve(__dirname, '../templates/template.sql'))))
        this.TOCTemplate = _.template(Buffer.from(await fs.readFile(path.resolve(__dirname, '../templates/template.toc'))))
        this.LUATemplate = _.template(Buffer.from(await fs.readFile(path.resolve(__dirname, '../templates/template.lua'))))
    }
}