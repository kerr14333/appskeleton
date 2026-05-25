const duckdb = require('duckdb');
const path = require('path');

const db = new duckdb.Database(':memory:');
const con = db.connect();

// Parquet file paths
const CES_DATA    = path.join(__dirname, 'ces_data.parquet').replace(/\\/g, '/');
const SERIES_INFO = path.join(__dirname, 'series_info.parquet').replace(/\\/g, '/');

// Promisified query helper — returns an array of row objects
function query(sql, ...params) {
  return new Promise((resolve, reject) => {
    con.all(sql, ...params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Register the parquet files as views so they can be queried by name
async function init() {
  await query(`CREATE VIEW ces_data    AS SELECT * FROM read_parquet('${CES_DATA}')`);
  await query(`CREATE VIEW series_info AS SELECT * FROM read_parquet('${SERIES_INFO}')`);
}

module.exports = { query, init };
