import Sequelize from 'sequelize'

export class Cookie extends Sequelize.Model {

	static init(sequelize, DataTypes) {
		return super.init({
			cookie: DataTypes.TEXT,
		}, {
			sequelize
		})
	}

}