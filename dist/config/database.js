const configDB = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "admind",
    database: "system-pc",
    entities: [
        "src/entity/**/*.ts"
    ],
    migrations: [
        "src/migration/**/*.ts"
    ],
    subscribers: [
        "src/subscriber/**/*.ts"
    ],
    cli: {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    }
};
//# sourceMappingURL=database.js.map