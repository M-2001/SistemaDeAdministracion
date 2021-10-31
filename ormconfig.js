require("dotenv").config();
module.exports = {

	"type": process.env.TYPEORM_CONNECTION,
	"host": process.env.TYPEORM_HOST,
	"port": parseInt(process.env.TYPEORM_PORT, 10),
	"username": process.env.TYPEORM_USERNAME,
	"password": process.env.TYPEORM_PASSWORD,
	"database": process.env.TYPEORM_DATABASE,
	"synchronize": process.env.TYPEORM_SYNCHRONIZE,
	"logging": process.env.TYPEORM_LOGGING,

	"entities": [
		process.env.TYPEORM_ENTITIES
	],
	"migrations": [
		process.env.TYPEORM_MIGRATIONS
	],
	"subscribers": [
		process.env.TYPEORM_SUBSCRIBER
	],
	"cli": {
		"entitiesDir": "dist/entity",
		"migrationsDir": "dist/migration",
		"subscribersDir": "dist/subscriber"
	}
}
