const { DataSource } = require('typeorm');

const { entities } = require('../entities');

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  synchronize: false,
  logging: false,
  entities,
});

module.exports = dataSource;
