const mysql2 = require('mysql2');
const CryptoJS = require('crypto-js');

const db = mysql.createPool({
    host: "dam.inspedralbes.cat",
    user: "a22oscmungar_doginder",
    password: "Doginder2023",
    database: "a22oscmungar_doginder",
    connectionLimit: 100,
  });
