module.exports={
    "type": "mysql",
    "host": "remotemysql.com",
    "port": 3306,
    "username": "KY5FBukBBf",
    "password": "1VKO4gChz4",
    "database": "KY5FBukBBf",
    "synchronize": true,
    "logging": false,
    "entities": [
       "dist/entity/**/*.js"
    ],
    "migrations": [
       "dist/migration/**/*.js"
    ],
    "subscribers": [
       "dist/subscriber/**/*.js"
    ],
    "cli": {
       "entitiesDir": "dist/entity",
       "migrationsDir": "dist/migration",
       "subscribersDir": "dist/subscriber"
    }
}