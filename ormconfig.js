module.exports = {

   "type": "mysql",
   "host": "remotemysql.com",
   "port": 3306,
   "username": "wevbdYXWC1",
   "password": "Ht7TqGGjPl",
   "database": "wevbdYXWC1",
   "synchronize": true,
   "logging": false,

   // "type": "mysql",
   // "host": "localhost",
   // "port": 3306,
   // "username": "root",
   // "password": "admind",
   // "database": "system-pc",
   // "synchronize": true,
   // "logging": false,

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
