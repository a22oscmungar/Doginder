const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const http = require("http");
const app = express();
const port = 3745;
const CryptoJS = require("crypto-js");
const { connect } = require("http2");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const db = mysql.createPool({
  host: "dam.inspedralbes.cat",
  user: "a22oscmungar_doginder",
  password: "Doginder2023",
  database: "a22oscmungar_doginder",
  connectionLimit: 100,
});
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

io.on("connection", (socket) => {
  console.log("Usuario conectado: ", socket.id);

  socket.on("match", (data) => {
    console.log("Nuevo match:", data);
    //io.emit("match", data);
  });
  socket.on("nuevoMensaje", (mensaje, idUsu1, idUsu2, idUsu) => {
    console.log("Nuevo mensaje:", mensaje);
    console.log("idUsu1:", idUsu1);
    console.log("idUsu2:", idUsu2);

    const sql = `SELECT socketId FROM SOCKETSID WHERE idUsu = ?`;
    db.query(sql, idUsu2, (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error" });
      } else {
        if (result.length === 0) {
          console.log("Usuario no encontrado");
        } else {
          console.log("SocketId: ", result[0].socketId);
          console.log(
            "Mensaje: ",
            mensaje,
            " idUsu1: ",
            idUsu1,
            " idUsu2: ",
            idUsu2
          );
          io.to(result[0].socketId).emit(
            "nuevoMensaje",
            mensaje,
            idUsu1,
            idUsu2,
            idUsu
          );
        }
      }
    });
  });
  socket.on("disconnect", () => {
    console.log("Usuario desconectado: ", socket.id);
  });
});

function emitir_evento(socketId, tipoInteraccion) {
  console.log("se ha llamado a emitir_evento");
  io.to(socketId).emit(tipoInteraccion);
}

global.emitir_evento = emitir_evento;

// Ruta para obtener todos los usuarios dentro de un rango de distancia
app.get("/users/nearby", (req, res) => {
  const currentLatitude = parseFloat(req.query.latitude);
  const currentLongitude = parseFloat(req.query.longitude);
  const radiusInKm = parseFloat(req.query.radius) * 10 || 10.0;
  const idUsu = req.query.idUsu;

  // console.log("currentLatitude:", currentLatitude);
  // console.log("currentLongitude:", currentLongitude);
  // console.log("radiusInKm:", radiusInKm);
  // console.log("idUsu:", idUsu);

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
      console.error(err);
      res
        .status(500)
        .json({ error: "Error en la consulta de usuarios cercanos" });
    } else {
      //console.log(results);
      res.json(results);
    }
  });
});

// Ruta para agregar un nuevo usuario
app.post("/users", upload.single("imagenFile"), (req, res) => {
  console.log("Recibiendo solicitud POST en /users");

  // Imprimir el cuerpo de la solicitud
  console.log("Cuerpo de la solicitud:", req.body);
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
    !petFriendlyPeople
  ) {
    console.log("Faltan datos obligatorios");
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  const passCrypto = CryptoJS.MD5(pass).toString();

  const location = `POINT(${longitude} ${latitude})`;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen en el servidor

  console.log("Ubicación:", location);
  console.log("Imagen:", imageUrl);

  const query = `
    INSERT INTO USUARIO (nombreUsu, ubiUsu, apellidosUsu, mailUsu, pass, genero, edadUsu) VALUES (?, ST_GeomFromText(?), (?), (?), ?, ?, ?)
`;
  const values = [name, location, surname, mailUsu, passCrypto, gender, age];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      const idHumano = result.insertId;

      const query2 = `insert into MASCOTA (nombre, edad, sexo, foto, descripcion, relacionHumanos, relacionMascotas, idHumano, raza) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      values2 = [
        petName,
        petAge,
        petGender,
        imageUrl,
        petDescription,
        petFriendlyPeople,
        petFriendlyPets,
        idHumano,
        petBreed,
      ];

      db.query(query2, values2, (err, result) => {
        if (err) {
          console.error("Error en la consulta de inserción:", err);
          res.status(500).json({ error: "Error al agregar el usuario" });
        } else {
          const sql3 = `INSERT INTO SOCKETSID(idUsu) VALUES (?)`;
          db.query(sql3, idHumano, (err, result) => {
            if (err) {
              console.error("Error en la consulta de inserción:", err);
              res.status(500).json({ error: "Error al agregar el usuario" });
            } else {
              console.log("añadido al socket");
            }
          });
          res.json({ success: true, userId: result.insertId });
        }
      });
    }
  });
});

// Ruta para update de la tabla sockets
app.post("/socketUpdate", (req, res) => {
  const idUsu = req.query.idUsu;
  const socketID = req.query.socketID;

  console.log("idUsu: ", idUsu);
  console.log("socketID: ", socketID);

  const sql = `UPDATE SOCKETSID SET socketId = ? WHERE idUsu = ?`;

  db.query(sql, [socketID, idUsu], (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      console.log(result);
      res.json(result);
    }
  });
});

//ruta para obtener los matches de un usuario
app.get("/matches", (req, res) => {
  const idUsu = req.query.idUsu;

  const sql = `SELECT U.*, M.* FROM USUARIO U JOIN MASCOTA M ON U.idUsu = M.idHumano
  JOIN INTERACCIONES I ON (U.idUsu = I.idUsu1 OR U.idUsu = I.idUsu2)
  WHERE (I.idUsu1 = ${idUsu} OR I.idUsu2 = ${idUsu}) AND I.EsMatch = 1 AND U.idUsu <> ${idUsu}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      res.json(result);
    }
  });
});

app.get("/pass", (req, res) => {
  const pass = req.body.pass;

  res.send(CryptoJS.MD5(pass).toString());
});

app.post("/login", (req, res) => {
  const { mailUsu, passUsu } = req.body;
  // console.log("mailUsu: ", mailUsu);
  // console.log("passUsu: ", passUsu);

  if (!mailUsu || !passUsu) {
    console.log("Faltan datos obligatorios");
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  } else {
    const sql = `SELECT USUARIO.*, MASCOTA.* FROM USUARIO LEFT JOIN MASCOTA ON USUARIO.idUsu = MASCOTA.idHumano WHERE USUARIO.mailUsu = ? ;`;

    db.query(sql, mailUsu, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        res.status(500).json({ error: "Error al agregar el usuario" });
      } else {
        let pass = CryptoJS.MD5(passUsu).toString();
        //console.log("Introducida: ", pass);
        //console.log("Correcta: ", result[0].pass);
        if (res == 0 || result[0].pass != pass) {
          //console.log("Usuario o contraseña incorrectos");
          res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        } else {
          //console.log("Usuario logueado correctamente");
          //console.log("UsuarioCompleto", result);
          const ubiUsu = result[0].ubiUsu;
          const idUsu = result[0].idUsu;
          const nombreUsu = result[0].nombreUsu;
          const apellidosUsu = result[0].apellidosUsu;
          const mailUsu = result[0].mailUsu;
          const pass = result[0].pass;
          const genero = result[0].genero;
          const edadUsu = result[0].edadUsu;
          const mascotaId = result[0].mascotaId;
          const nombre = result[0].nombre;
          const edad = result[0].edad;
          const sexo = result[0].sexo;
          const foto = result[0].foto;
          const descripcion = result[0].descripcion;
          const relacionHumanos = result[0].relacionHumanos;
          const relacionMascotas = result[0].relacionMascotas;
          const idHumano = result[0].idHumano;
          const raza = result[0].raza;
          res.json({
            idUsu,
            ubiUsu,
            nombreUsu,
            apellidosUsu,
            mailUsu,
            pass,
            genero,
            edadUsu,
            mascotaId,
            nombre,
            edad,
            sexo,
            foto,
            descripcion,
            relacionHumanos,
            relacionMascotas,
            idHumano,
            raza,
          });
        }
      }
    });
  }
});

//ruta para validar si un correo ya está registrado
app.get("/users/validateMail", (req, res) => {
  const mailUsu = req.query.mailUsu;
  console.log("mailUsu: ", mailUsu);

  if (!mailUsu) {
    console.log("Faltan datos obligatorios");
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  } else {
    const sql = `SELECT * FROM USUARIO WHERE mailUsu = ?`;

    db.query(sql, mailUsu, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        return res.status(500).json({ error: "Error al agregar el usuario" });
      } else {
        console.log(result);
        if (result.length === 0) {
          console.log("Correo no registrado");
          return res.status(404).json({ error: "Correo no registrado" });
        } else {
          return res.json({ result });
        }
      }
    });
  }
});

//ruta para los likes o dislikes
app.get("/interaccion", (req, res) => {
  let { idUsu1, idUsu2, tipoInteraccion } = req.query;

  // Asegurar que idUsu1 siempre sea menor o igual que idUsu2
  [idUsu1, idUsu2] = [Math.min(idUsu1, idUsu2), Math.max(idUsu1, idUsu2)];

  console.log("idUsu1: ", idUsu1);
  console.log("idUsu2: ", idUsu2);
  console.log("tipoInteraccion: ", tipoInteraccion);

  const sql = `
    INSERT INTO INTERACCIONES (idUsu1, idUsu2, tipoInteraccion)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      EsMatch = IF(tipoInteraccion = 'LIKE' AND EsMatch = 0, 1, EsMatch);
  `;

  const selectEsMatchSQL = `
    SELECT EsMatch
    FROM INTERACCIONES
    WHERE idUsu1 = ? AND idUsu2 = ?;
  `;

  db.query(sql, [idUsu1, idUsu2, tipoInteraccion], (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error al agregar el usuario" });
    }

    // Revisar si ha sido un "match"
    db.query(selectEsMatchSQL, [idUsu1, idUsu2], (err, rows) => {
      if (err) {
        console.error("Error en la consulta de selección:", err);
        return res.status(500).json({ error: "Error al verificar el match" });
      }

      if (rows.length > 0) {
        console.log(rows[0]);
        const esMatchActualizado = rows[0].EsMatch;

        // Si hay un cambio de 0 a 1, enviar el evento de socket
        if (esMatchActualizado === 1) {
          console.log("Match");
        
          // Utiliza Promise.all para esperar las promesas antes de continuar
          Promise.all([socketUsuario(idUsu1), socketUsuario(idUsu2)])
            .then(([socketUsu1, socketUsu2]) => {
              if (socketUsu1 && socketUsu2) {
                io.to(socketUsu1).emit("match");
                io.to(socketUsu2).emit("match");
                console.log("Se ha emitido el evento de match");
              } else {
                console.log("No se ha emitido el evento");
              }
            })
            .catch((error) => {
              console.error("Error al obtener sockets:", error);
            });
        }
      }

      // Respuesta exitosa
      res.json({ result });
    });
  });
});

function socketUsuario(idUsu) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT socketId FROM SOCKETSID WHERE idUsu = ?`;
    db.query(sql, idUsu, (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        reject(err);
      } else {
        if (result.length === 0) {
          console.log("Usuario no encontrado");
          resolve(null);
        } else {
          resolve(result[0].socketId);
        }
      }
    });
  });
}

app.post("/setPass", (req, res) => {
  const newPass = req.body.newPass;
  const usu = req.body.usu;

  let pass = CryptoJS.MD5(newPass).toString();

  const query = `UPDATE USUARIO SET pass = ? WHERE mailUsu = ?`;
  const VALUES = [pass, usu];

  db.query(query, VALUES, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      console.log(result);
      return res.json({ result });
    }
  });
});

app.get("/getPass", (req, res) => {
  const usu = req.query.usu;

  const query = `SELECT pass FROM USUARIO WHERE mailUsu = ?`;
  const VALUES = [usu];

  db.query(query, VALUES, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      console.log(result);
      return res.json({ result });
    }
  });
});

server.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
