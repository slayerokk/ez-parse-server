import Sequelize from 'sequelize'

export class Char extends Sequelize.Model {

	static init(sequelize, DataTypes) {
		return super.init({
			race: DataTypes.INTEGER,
			class: DataTypes.INTEGER,
			name: DataTypes.STRING(50),
			login: DataTypes.STRING(50),
			lvl: DataTypes.INTEGER,
			kills: DataTypes.INTEGER,
			gs: DataTypes.INTEGER,
			ap: DataTypes.INTEGER
		}, {
			indexes: [{
				unique: true,
				fields: ['name']
			}],
			sequelize
		})
	}

}