import Sequelize from 'sequelize'
import path from 'path'
import fs from 'fs'

const sequelize = new Sequelize(process.env.DB_CONNECTION, {
	dialect: 'mariadb',
	pool: {
		max: 5000,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	dialectOptions: {
		timezone: 'Etc/GMT+3'
	}
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