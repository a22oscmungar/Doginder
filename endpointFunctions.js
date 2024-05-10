const mysql = require("mysql2");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const moment = require("moment");

const db = mysql.createPool({
  host: "dam.inspedralbes.cat",
  user: "a22oscmungar_doginder",
  password: "Doginder2023",
  database: "a22oscmungar_doginder",
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "a22oscmungar@inspedralbes.cat",
    pass: "663626149Oo*",
  },
});

/**
 * Funció que permet fer login a l'usuari
 * @param {any} mailUsu
 * @param {any} passUsu
 * @returns {any}
 */
function login(mailUsu, passUsu) {
  return new Promise((resolve, reject) => {
    if (!mailUsu || !passUsu) {
      reject({ error: "Faltan datos obligatorios" });
    } else {
      const sql = `SELECT USUARIO.*, MASCOTA.* FROM USUARIO LEFT JOIN MASCOTA ON USUARIO.idUsu = MASCOTA.idHumano WHERE USUARIO.mailUsu = ? ;`;

      db.query(sql, mailUsu, (err, result) => {
        if (err) {
          console.error("Error en la consulta de inserción:", err);
          reject({ error: "Error al agregar el usuario" });
        } else {
          if (
            result.length === 0 ||
            result[0].pass !== CryptoJS.MD5(passUsu).toString()
          ) {
            reject({ error: "Usuario o contraseña incorrectos" });
          } else {
            const userData = {
              idUsu: result[0].idUsu,
              ubiUsu: result[0].ubiUsu,
              nombreUsu: result[0].nombreUsu,
              apellidosUsu: result[0].apellidosUsu,
              mailUsu: result[0].mailUsu,
              pass: result[0].pass,
              genero: result[0].genero,
              edadUsu: result[0].edadUsu,
              mascotaId: result[0].mascotaId,
              nombre: result[0].nombre,
              edad: result[0].edad,
              sexo: result[0].sexo,
              foto: result[0].foto,
              descripcion: result[0].descripcion,
              relacionHumanos: result[0].relacionHumanos,
              relacionMascotas: result[0].relacionMascotas,
              idHumano: result[0].idHumano,
              raza: result[0].raza,
              tamano: result[0].tamano,
              imgProfile: result[0].imgProfile,
            };
            resolve({ userData });
          }
        }
      });
    }
  });
}

/**
 * Funció que envia un correu electrònic amb un token per resetejar la password
 * @param {any} mail
 * @param {any} db
 * @returns {any}
 */
function sendMailWithToken(mail, db) {
  return new Promise((resolve, reject) => {
    const token = Math.floor(100000 + Math.random() * 900000);

    // Comprobar si ya existe un token para este usuario
    const sqlCheckToken = `SELECT * FROM tokens WHERE mail = ?`;
    db.query(sqlCheckToken, [mail], (err, result) => {
      if (err) {
        console.error("Error al comprobar el token:", err);
        reject({ error: "Error al comprobar el token" });
      } else {
        if (result.length > 0) {
          // Ya existe un token, actualizarlo en lugar de insertarlo de nuevo
          const sqlUpdateToken = `UPDATE tokens SET token = ? WHERE mail = ?`;
          db.query(sqlUpdateToken, [token, mail], (err, result) => {
            if (err) {
              console.error("Error al actualizar el token:", err);
              reject({ error: "Error al actualizar el token" });
            }
          });
        } else {
          // No hay token existente, insertar uno nuevo
          const sqlInsertToken = `INSERT INTO tokens (mail, token) VALUES (?, ?)`;
          db.query(sqlInsertToken, [mail, token], (err, result) => {
            if (err) {
              console.error("Error al insertar el token:", err);
              reject({ error: "Error al insertar el token" });
            }
          });
        }

        // Enviar el correo electrónico con el token
        let mailOptions = {
          from: "a22oscmungar@inspedralbes.cat",
          to: mail,
          subject: "Asunto del correo",
          html: `Tu token es: ${token}`,
        };

        // Envía el correo electrónico
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error al enviar el correo electrónico:", error);
            reject({ error: "Error al enviar el correo electrónico" });
          } else {
            console.log("Correo electrónico enviado:", info.response);
            resolve({
              message: "Correo electrónico enviado exitosamente",
              token: token.toString(),
            });
          }
        });
      }
    });
  });
}

/**
 * Funció que comprova si el token introduït a android és correcte
 * @param {any} mail
 * @param {any} token
 * @param {any} db
 * @returns {any}
 */
function checkToken(mail, token, db) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM TOKENS WHERE mail = ? AND token = ?`;
    const values = [mail, token];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        reject({ error: "Error en la consulta de inserción" });
      } else {
        console.log(result);
        resolve({ result });
      }
    });
  });
}

/**
 * Funció que permet canviar la contrasenya de l'usuari
 * @param {any} mail
 * @param {any} pass
 * @param {any} db
 * @returns {any}
 */
function changePassword(mail, pass, db) {
  return new Promise((resolve, reject) => {
    const passCrypted = CryptoJS.MD5(pass).toString();
    const sql = `UPDATE USUARIO SET pass = ? WHERE mailUsu = ?`;
    const values = [passCrypted, mail];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(
          "Error en la consulta de actualización de contraseña:",
          err
        );
        reject({ error: "Error al actualizar la contraseña" });
      } else {
        console.log(result);
        resolve({ result });
      }
    });
  });
}

/**
 * Funció que permet trobar els usuaris propers a l'usuari actual dins d'un radi determinat
 * @param {any} currentLatitude
 * @param {any} currentLongitude
 * @param {any} radiusInKm
 * @param {any} idUsu
 * @param {any} db
 * @returns {any}
 */
function findNearbyUsers(
  currentLatitude,
  currentLongitude,
  radiusInKm,
  idUsu,
  db
) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
            U.idUsu, 
            U.nombreUsu, 
            U.apellidosUsu,
            U.mailUsu,
            U.pass,
            U.genero,
            U.edadUsu,
            U.ubiUsu,
            U.imgProfile,
            ST_X(U.ubiUsu) AS latitude, 
            ST_Y(U.ubiUsu) AS longitude,
            ST_DISTANCE_SPHERE(U.ubiUsu, ST_GeomFromText('POINT(${currentLongitude} ${currentLatitude})', 4326))/1000 AS distance,
            M.mascotaId,
            M.nombre, 
            M.edad,
            M.sexo, 
            M.foto, 
            M.descripcion, 
            M.relacionHumanos, 
            M.relacionMascotas,
            M.raza
        FROM USUARIO U
        LEFT JOIN MASCOTA M ON U.idUsu = M.idHumano
        WHERE U.idUsu <> ${idUsu}
        AND NOT EXISTS (
          SELECT 1 FROM INTERACCIONES 
          WHERE (idUsu1 = ${idUsu} AND idUsu2 = U.idUsu)
             OR (idUsu1 = ${idUsu} AND idUsu2 = U.idUsu AND EsMatch = 1)
             OR (idUsu1 = U.idUsu AND idUsu2 = ${idUsu} AND EsMatch = 1)
        )
        HAVING distance <= ${radiusInKm}
      `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error en la consulta de usuarios cercanos:", err);
        reject({ error: "Error en la consulta de usuarios cercanos" });
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Funció que permet trobar tots els usuaris propers a l'usuari actual dins d'un radi determinat (sense comprovar dislikes)
 * @param {any} currentLatitude
 * @param {any} currentLongitude
 * @param {any} radiusInKm
 * @param {any} idUsu
 * @param {any} db
 * @returns {any}
 */
function findAllNearbyUsers(
  currentLatitude,
  currentLongitude,
  radiusInKm,
  idUsu,
  db
) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
            U.idUsu, 
            U.nombreUsu, 
            U.apellidosUsu,
            U.mailUsu,
            U.pass,
            U.genero,
            U.edadUsu,
            U.ubiUsu,
            U.imgProfile,
            ST_X(U.ubiUsu) AS latitude, 
            ST_Y(U.ubiUsu) AS longitude,
            ST_DISTANCE_SPHERE(U.ubiUsu, ST_GeomFromText('POINT(${currentLongitude} ${currentLatitude})', 4326))/1000 AS distance,
            M.mascotaId,
            M.nombre, 
            M.edad,
            M.sexo, 
            M.foto, 
            M.descripcion, 
            M.relacionHumanos, 
            M.relacionMascotas,
            M.raza
        FROM USUARIO U
        LEFT JOIN MASCOTA M ON U.idUsu = M.idHumano
        WHERE U.idUsu <> ${idUsu}
        AND NOT EXISTS (
          SELECT 1 FROM INTERACCIONES 
          WHERE (idUsu1 = ${idUsu} AND idUsu2 = U.idUsu AND EsMatch = 1)
             OR (idUsu1 = U.idUsu AND idUsu2 = ${idUsu} AND EsMatch = 1)
        )
        HAVING distance <= ${radiusInKm}
      `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error en la consulta de usuarios cercanos:", err);
        reject({ error: "Error en la consulta de usuarios cercanos" });
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Funció que permet registrar un usuari amb la seva mascota
 * @param {any} req
 * @returns {any}
 */
function createUser(req) {
  return new Promise((resolve, reject) => {
    const {
      name,
      latitude,
      longitude,
      surname,
      mailUsu,
      pass,
      age,
      gender,
      petName,
      petAge,
      petGender,
      petBreed,
      petDescription,
      petFriendlyPets,
      petFriendlyPeople,
    } = req.body;

    console.log(req.body);

    const imgProfile = "/uploads/" + req.files["imgProfile"][0].filename; // Imagen del usuario
    const imgPerfilFile = "/uploads/" + req.files["imgPerfilFile"][0].filename; // Imagen del perfil

    if (
      !name ||
      !latitude ||
      !longitude ||
      !surname ||
      !mailUsu ||
      !pass ||
      !age ||
      !gender ||
      !petName ||
      !petAge ||
      !petGender ||
      !petBreed ||
      !petDescription ||
      !petFriendlyPets ||
      !petFriendlyPeople ||
      !imgProfile
    ) {
      reject({ error: "Faltan datos obligatorios" });
    }

    const passCrypto = CryptoJS.MD5(pass).toString();
    const location = `POINT(${longitude} ${latitude})`;

    // Obtén la edad del cuerpo de solicitud y conviértela a milisegundos
    //const ageDate = moment(ageMillis).format("YYYY-MM-DD");

    //console.log("ageTimestamp es:", ageDate);

    const query = `
        INSERT INTO USUARIO (nombreUsu, ubiUsu, apellidosUsu, mailUsu, pass, genero, edadUsu, imgProfile) VALUES ('${name}', ST_GeomFromText('${location}'), '${surname}', '${mailUsu}', '${passCrypto}', '${gender}', '${age}', '${imgPerfilFile}')
      `;

    console.log(query);
    // const values = [
    //   name,
    //   location,
    //   surname,
    //   mailUsu,
    //   passCrypto,
    //   gender,
    //   ageDate,
    //   imgPerfilFile,
    // ];

    db.query(query, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        reject({ error: "Error al agregar el usuario" });
      }
      console.log(result);
      const idHumano = result.insertId;

      const query2 = `
          INSERT INTO MASCOTA (nombre, edad, sexo, foto, descripcion, relacionHumanos, relacionMascotas, idHumano, raza) 
          VALUES ('${petName}', '${petAge}', '${petGender}', '${imgProfile}', '${petDescription}', '${petFriendlyPeople}', '${petFriendlyPets}', ${idHumano}, '${petBreed}')
        `;

      console.log(query2);
      const values2 = [
        petName,
        petAge,
        petGender,
        imgProfile,
        petDescription,
        petFriendlyPeople,
        petFriendlyPets,
        idHumano,
        petBreed,
      ];

      db.query(query2, (err, result) => {
        if (err) {
          reject({ error: "Error al agregar la mascota" });
        }

        const sql3 = `INSERT INTO SOCKETSID(idUsu) VALUES (?)`;
        db.query(sql3, idHumano, (err, result) => {
          if (err) {
            reject({ error: "Error al agregar el usuario al socket" });
          }

          console.log("Usuario añadido al socket");
        });

        resolve({ success: true, userId: idHumano });
      });
    });
  });
}

/**
 * Funció per actualitzar el socket de l'usuari a la base de dades
 * @param {any} req
 * @returns {any}
 */
function updateSocket(req) {
  return new Promise((resolve, reject) => {
    const idUsu = req.query.idUsu;
    const socketID = req.query.socketID;

    const sql = `UPDATE SOCKETSID SET socketId = ? WHERE idUsu = ?`;

    db.query(sql, [socketID, idUsu], (err, result) => {
      if (err) {
        console.error("Error en la consulta de actualización de socket:", err);
        reject({ error: "Error al actualizar el socket" });
      } else {
        console.log("Actualización de socket exitosa:", result);
        resolve(result);
      }
    });
  });
}

/**
 * Funció que permet obtenir els matches de l'usuari actual
 * @param {any} req
 * @returns {any}
 */
function getMatches(req) {
  return new Promise((resolve, reject) => {
    const idUsu = req.query.idUsu;

    const sql = `
        SELECT U.*, M.* 
        FROM USUARIO U 
        JOIN MASCOTA M ON U.idUsu = M.idHumano
        JOIN INTERACCIONES I ON (U.idUsu = I.idUsu1 OR U.idUsu = I.idUsu2)
        WHERE (I.idUsu1 = ? OR I.idUsu2 = ?) 
        AND I.EsMatch = 1 
        AND U.idUsu <> ? 
        AND U.idUsu NOT IN (
          SELECT usuario_bloqueado_id 
          FROM BLOQUEOS 
          WHERE usuario_bloqueador_id = ?
        )
      `;

    db.query(sql, [idUsu, idUsu, idUsu, idUsu], (err, result) => {
      if (err) {
        console.error("Error en la consulta de obtención de matches:", err);
        reject({ error: "Error al obtener los matches" });
      }

      resolve(result);
    });
  });
}

/**
 * Funció que permet bloquejar un usuari
 * @param {any} req
 * @returns {any}
 */
function bloquearUsuario(req) {
  return new Promise((resolve, reject) => {
    const usuarioBloqueador = req.body.usuarioBloqueador;
    const usuarioBloqueado = req.body.usuarioBloqueado;

    // Insertar el registro de bloqueo en la tabla BLOQUEOS
    const sql =
      "INSERT INTO BLOQUEOS (usuario_bloqueador_id, usuario_bloqueado_id) VALUES (?, ?)";
    const values = [usuarioBloqueador, usuarioBloqueado];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al bloquear usuario:", err);
        reject({ error: "Error al bloquear usuario" });
      } else {
        console.log("Usuario bloqueado con éxito.");
        resolve({ message: "Usuario bloqueado con éxito" });
      }
    });
  });
}

/**
 * Funció que permet validar el correu electrònic de l'usuari
 * @param {any} req
 * @returns {any}
 */
function validateMail(req) {
  return new Promise((resolve, reject) => {
    const mailUsu = req.query.mailUsu;

    if (!mailUsu) {
      reject({ error: "Faltan datos obligatorios" });
    } else {
      const sql = `SELECT * FROM USUARIO WHERE mailUsu = ?`;

      db.query(sql, mailUsu, (err, result) => {
        if (err) {
          console.error("Error en la consulta de inserción:", err);
          reject({ error: "Error al agregar el usuario" });
        } else {
          if (result.length === 0) {
            reject({ error: "Correo no registrado" });
          } else {
            resolve(result);
          }
        }
      });
    }
  });
}

/**
 * Funció per registrar una interacció entre dos usuaris (like, dislike, match)
 * @param {any} req
 * @returns {any}
 */
function interaccion(req) {
  return new Promise((resolve, reject) => {
    let { idUsu1, idUsu2, tipoInteraccion } = req.query;

    console.log("idUsu1: ", idUsu1);
    console.log("idUsu2: ", idUsu2);
    console.log("tipoInteraccion: ", tipoInteraccion);

    const checkMatch = `SELECT * FROM INTERACCIONES WHERE idUsu1 = ? AND idUsu2 = ?`;

    db.query(checkMatch, [idUsu2, idUsu1], (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        reject({ error: "Error al agregar el usuario" });
      } else {
        if (result.length > 0) {
          const hayMatch = `UPDATE INTERACCIONES SET EsMatch = 1 WHERE idUsu1 = ? AND idUsu2 = ?`;
          db.query(hayMatch, [idUsu2, idUsu1], (err, result) => {
            if (err) {
              console.error("Error en la consulta de inserción:", err);
              reject({ error: "Error al agregar el usuario" });
            } else {
              console.log(result);
              resolve([idUsu1, idUsu2]);
            }
          });
        } else {
          const noHabiaMatch = `INSERT INTO INTERACCIONES (idUsu1, idUsu2, tipoInteraccion) VALUES (?, ?, ?)`;
          db.query(
            noHabiaMatch,
            [idUsu1, idUsu2, tipoInteraccion],
            (err, result) => {
              if (err) {
                console.error("Error en la consulta de inserción:", err);
                reject({ error: "Error al agregar el usuario" });
              } else {
                console.log(result);
                resolve([idUsu1, idUsu2]);
              }
            }
          );
        }
      }
    });
  });
}

/**
 * Funció per canviar la contrasenya de l'usuari
 * @param {any} req
 * @returns {any}
 */
function setPass(req) {
  return new Promise((resolve, reject) => {
    const { newPass, usu } = req.body;

    let pass = CryptoJS.MD5(newPass).toString();

    const query = `UPDATE USUARIO SET pass = ? WHERE mailUsu = ?`;
    const values = [pass, usu];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        reject({ error: "Error al agregar el usuario" });
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

/**
 * Funció per obtenir la contrasenya de l'usuari
 * @param {any} req
 * @returns {any}
 */
function getPass(req) {
  return new Promise((resolve, reject) => {
    const usu = req.query.usu;

    const query = `SELECT pass FROM USUARIO WHERE mailUsu = ?`;
    const values = [usu];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        reject({ error: "Error al obtener la contraseña" });
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

/**
 * Funció per obtenir els usuaris als quals han donat dislike l'usuari actual
 * @param {any} req
 * @returns {any}
 */
function getDislikedUsers(req) {
  return new Promise((resolve, reject) => {
    const idUsu = req.query.idUsu;

    const query = `
        SELECT USUARIO.*, MASCOTA.*
        FROM INTERACCIONES
        JOIN USUARIO ON INTERACCIONES.idUsu2 = USUARIO.idUsu
        JOIN MASCOTA ON USUARIO.idUsu = MASCOTA.idHumano
        WHERE INTERACCIONES.idUsu1 = ?
        AND INTERACCIONES.tipoInteraccion = "DISLIKE"
      `;
    db.query(query, idUsu, (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        reject({ error: "Error al obtener los dislikes" });
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

module.exports = {
  login,
  sendMailWithToken,
  checkToken,
  changePassword,
  findNearbyUsers,
  findAllNearbyUsers,
  createUser,
  updateSocket,
  getMatches,
  bloquearUsuario,
  validateMail,
  interaccion,
  setPass,
  getPass,
  getDislikedUsers,
};
