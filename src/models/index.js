import Sequelize from 'sequelize'
import path from 'path'
import fs from 'fs'

const DB_CONNECTION = process.env.DB_CONNECTION || 'sqlite::memory:'

const sequelize = new Sequelize(DB_CONNECTION, {
	dialect: 'mariadb',
	dialectOptions: {
		timezone: 'Etc/GMT+3'
	},
	logging: false
})

const models = Object.assign({}, ...fs.readdirSync(__dirname)
	.filter(file => file.includes('model'))
	.map(file => {
		const cortage = require(path.join(__dirname, file))
		return {
			[Object.keys(cortage)[0]]: Object.values(cortage)[0].init(sequelize, Sequelize)
		}
	})
)

Object.values(models)
	.filter(model => typeof model.associate === 'function')
	.forEach(model => model.associate(models))

export default {
	...models,
	sequelize
}