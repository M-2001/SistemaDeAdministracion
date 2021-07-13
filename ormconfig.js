module.exports = {

   "type": "mysql",
   "host": "bq6vldnozdexnnlzcigr-mysql.services.clever-cloud.com",
   "port": 3306,
   "username": "upm87sccb1la3vqv",
   "password": "O1tz2cxyiqHsRWUb8nWw",
   "database": "bq6vldnozdexnnlzcigr",
   "synchronize": true,
   "logging": false,

   // "type": "mysql",
   // "host": "localhost",
   // "port": 3306,
   // "username": "root",
   // "password": "admind",
   // "database": process.env.databaseLocal,
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
