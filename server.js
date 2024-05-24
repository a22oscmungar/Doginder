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

const {
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
  setPass,
  getPass,
  getDislikedUsers,
  reporte
} = require("./endpointFunctions.js");

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

app.get("/", (req, res) => {
  res.send("Bienvenido a Doginder, digo, guau! 🐶");
});

// Ruta para enviar el correo con el token
app.post("/sendMail", async (req, res) => {
  const mail = req.body.mail;

  try {
    const result = await sendMailWithToken(mail, db);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para verificar el token
app.get("/checkToken", async (req, res) => {
  const mail = req.query.mail;
  const token = req.query.token;

  try {
    const result = await checkToken(mail, token, db);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para cambiar la contraseña
app.post("/changePass", async (req, res) => {
  const { mail, pass } = req.body;

  try {
    const result = await changePassword(mail, pass, db);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para buscar usuarios cercanos
app.get("/users/nearby", async (req, res) => {
  const currentLatitude = parseFloat(req.query.latitude);
  const currentLongitude = parseFloat(req.query.longitude);
  const radiusInKm = parseFloat(req.query.radius) * 10 || 10.0;
  const idUsu = req.query.idUsu;

  try {
    const results = await findNearbyUsers(
      currentLatitude,
      currentLongitude,
      radiusInKm,
      idUsu,
      db
    );
    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para buscar todos los usuarios dentro de un rango de distancia
app.get("/users/nearbyAll", async (req, res) => {
  const currentLatitude = parseFloat(req.query.latitude);
  const currentLongitude = parseFloat(req.query.longitude);
  const radiusInKm = parseFloat(req.query.radius) * 10 || 10.0;
  const idUsu = req.query.idUsu;

  try {
    const results = await findAllNearbyUsers(
      currentLatitude,
      currentLongitude,
      radiusInKm,
      idUsu,
      db
    );
    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para registrar un nuevo usuario
app.post("/users",  upload.fields([{ name: "imgProfile", maxCount: 1 },{ name: "imgPerfilFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const result = await createUser(req);
      console.log(result);
      res.json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// Ruta para actualizar la tabla sockets
app.post("/socketUpdate", async (req, res) => {
  try {
    const result = await updateSocket(req);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para obtener los matches de un usuario
app.get("/matches", async (req, res) => {
  try {
    const result = await getMatches(req);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});
// Ruta para bloquear a un usuario
app.post("/bloquearUsuario", async (req, res) => {
  try {
    await bloquearUsuario(req);
    res.status(200).json({ message: "Usuario bloqueado con éxito" });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/login", async (req, res) => {
  const { mailUsu, passUsu } = req.body;

  try {
    const { userData } = await login(mailUsu, passUsu, db);
    res.json(userData);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Ruta para validar si un correo ya está registrado
app.get("/users/validateMail", async (req, res) => {
  try {
    const result = await validateMail(req);
    res.json(result);
  } catch (error) {
    if (
      error.error === "Faltan datos obligatorios" ||
      error.error === "Correo no registrado"
    ) {
      res.status(404).json(error);
    } else {
      res.status(500).json(error);
    }
  }
});

//ruta para los likes o dislikes
app.get("/interaccion", (req, res) => {
  let { idUsu1, idUsu2, tipoInteraccion } = req.query;

  console.log("idUsu1: ", idUsu1);
  console.log("idUsu2: ", idUsu2);
  console.log("tipoInteraccion: ", tipoInteraccion);

  const checkMatch = `SELECT * FROM INTERACCIONES WHERE idUsu1 = ${idUsu2} AND idUsu2 = ${idUsu1}`;

  db.query(checkMatch, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error al agregar el usuario" });
    } else {
      if (result.length > 0) {
        const hayMatch = `UPDATE INTERACCIONES SET EsMatch = 1 WHERE idUsu1 = ${idUsu2} AND idUsu2 = ${idUsu1}`;
        db.query(hayMatch, (err, result) => {
          if (err) {
            console.error("Error en la consulta de inserción:", err);
            return res
              .status(500)
              .json({ error: "Error al agregar el usuario" });
          } else {
            console.log(result);
            // Utiliza Promise.all para esperar las promesas antes de continuar
            Promise.all([socketUsuario(idUsu1), socketUsuario(idUsu2)])
              .then(([socketUsu1, socketUsu2]) => {
                if (socketUsu1 && socketUsu2) {
                  io.to(socketUsu1).emit("match");
                  io.to(socketUsu2).emit("match");
                  console.log(
                    `SocketId1: ${socketUsu1}, SocketId2: ${socketUsu2}`
                  );
                  console.log("Se ha emitido el evento de match");
                } else {
                  console.log("No se ha emitido el evento");
                }
              })
              .catch((error) => {
                console.error("Error al obtener sockets:", error);
              });
            return res.json({ result });
          }
        });
      } else {
        const noHabiaMatch = `INSERT INTO INTERACCIONES (idUsu1, idUsu2, tipoInteraccion) VALUES (${idUsu1}, ${idUsu2}, '${tipoInteraccion}')`;

        db.query(noHabiaMatch, (err, result) => {
          if (err) {
            console.error("Error en la consulta de inserción:", err);
            return res
              .status(500)
              .json({ error: "Error al agregar el usuario" });
          } else {
            console.log(result);
            return res.json({ result });
          }
        });
      }
    }
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

// Ruta para cambiar rápidamente la contraseña
app.post("/setPass", async (req, res) => {
  try {
    const result = await setPass(req);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para obtener la contraseña
app.get("/getPass", async (req, res) => {
  try {
    const result = await getPass(req);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para obtener los usuarios a los que has dado "no"
app.get("/getNo", async (req, res) => {
  try {
    const result = await getDislikedUsers(req);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Ruta para enviar mail de reporte
app.post("/report", async (req, res) => {
  const { idUsu, idUsuReportado, motivo } = req.query;
  console.log(req.query);

  // ahora con una promesa llamamos a la funcion reporte pasando los parametros
  reporte(idUsu, idUsuReportado, motivo)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

server.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
