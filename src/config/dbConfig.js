const Pool = require('pg').Pool;


const pool = new Pool({
    host: "localhost",
    user: "pgadmin",
    port: 25432,
    password: "secret",
    database: "postgres"
})

module.exports = pool;

