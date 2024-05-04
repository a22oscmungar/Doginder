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
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "a22oscmungar@inspedralbes.cat",
    pass: "663626149Oo*",
  },
});

// ruta para enviar el mail
app.post("/sendMail", (req, res) => {
  const mail = req.body.mail;
  console.log("mail: ", mail);

  // Verificar la configuración de la conexión
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const token = Math.floor(100000 + Math.random() * 900000);

  // Comprobar si ya existe un token para este usuario
  const sqlCheckToken = `SELECT * FROM tokens WHERE mail = ?`;
  db.query(sqlCheckToken, [mail], (err, result) => {
    if (err) {
      console.error("Error al comprobar el token:", err);
      return res.status(500).json({ error: "Error" });
    } else {
      if (result.length > 0) {
        // Ya existe un token, actualizarlo en lugar de insertarlo de nuevo
        const sqlUpdateToken = `UPDATE tokens SET token = ? WHERE mail = ?`;
        db.query(sqlUpdateToken, [token, mail], (err, result) => {
          if (err) {
            console.error("Error al actualizar el token:", err);
            return res.status(500).json({ error: "Error" });
          }
        });
      } else {
        // No hay token existente, insertar uno nuevo
        const sqlInsertToken = `INSERT INTO tokens (mail, token) VALUES (?, ?)`;
        db.query(sqlInsertToken, [mail, token], (err, result) => {
          if (err) {
            console.error("Error al insertar el token:", err);
            return res.status(500).json({ error: "Error" });
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
          console.log("Error al enviar el correo electrónico:", error);
        } else {
          console.log("Correo electrónico enviado:", info.response);
        }
      });

      res.send(token.toString());
    }
  });
});

app.get("/checkToken", (req, res) => {
  const mail = req.query.mail;
  const token = req.query.token;

  const sql = `SELECT * FROM TOKENS WHERE mail = ? AND token = ?`;
  const values = [mail, token];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error" });
    } else {
      console.log(result);
      return res.json({ result });
    }
  });
});

app.post("/changePass",(req,res)=>{
  const {mail,pass} = req.body;

  let passCrypted = CryptoJS.MD5(pass).toString();

  const sql = `UPDATE USUARIO SET pass = ? WHERE mailUsu = ?`;
  const values = [passCrypted,mail];

  db.query(sql,values,(err,result)=>{
    if(err){
      console.error("Error en la consulta de inserción:", err);
      return res.status(500).json({ error: "Error al agregar el usuario" });
    }else{
      console.log(result);
      return res.json({result});
    }
  });
});

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
        M.raza,
        M.tamano,
        M.terreno
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
    imgProfile,
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
    !petFriendlyPeople ||
    !imgProfile
  ) {
    console.log("Faltan datos obligatorios");
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  const passCrypto = CryptoJS.MD5(pass).toString();

  const location = `POINT(${longitude} ${latitude})`;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen en el servidor
  const imageProfileUrl = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen en el servidor

  console.log("Ubicación:", location);
  console.log("Imagen:", imageUrl);

  const query = `
    INSERT INTO USUARIO (nombreUsu, ubiUsu, apellidosUsu, mailUsu, pass, genero, edadUsu, imgProfile) VALUES (?, ST_GeomFromText(?), (?), (?), ?, ?, ?)
`;
  const values = [name, location, surname, mailUsu, passCrypto, gender, age, imageProfileUrl];

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

  const sql = `SELECT U.*, M.* FROM USUARIO U 
  JOIN MASCOTA M ON U.idUsu = M.idHumano
  JOIN INTERACCIONES I ON (U.idUsu = I.idUsu1 OR U.idUsu = I.idUsu2)
  WHERE (I.idUsu1 = ${idUsu} OR I.idUsu2 = ${idUsu}) 
  AND I.EsMatch = 1 
  AND U.idUsu <> ${idUsu} 
  AND U.idUsu NOT IN (SELECT usuario_bloqueado_id FROM BLOQUEOS WHERE usuario_bloqueador_id = ${idUsu})`;


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

//ruta para bloquear a un usuario
app.post("/bloquearUsuario",(req,res)=>{
  const usuarioBloqueador = req.body.usuarioBloqueador;
  const usuarioBloqueado = req.body.usuarioBloqueado;

  // Insertar el registro de bloqueo en la tabla BLOQUEOS
  const sql = "INSERT INTO BLOQUEOS (usuario_bloqueador_id, usuario_bloqueado_id) VALUES (?, ?)";
  const values = [usuarioBloqueador, usuarioBloqueado];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al bloquear usuario:", err);
      return res.status(500).json({ error: "Error al bloquear usuario" });
    } else {
      console.log("Usuario bloqueado con éxito.");
      return res.status(200).json({ message: "Usuario bloqueado con éxito" });
    }
  });
})

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
          const tamano = result[0].tamano;
          const terreno = result[0].terreno;
          const imgProfile = result[0].imgProfile;
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
            tamano,
            terreno,
            imgProfile,
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
            return res.status(500).json({ error: "Error al agregar el usuario" });
          } else {
            console.log(result);
            // Utiliza Promise.all para esperar las promesas antes de continuar
          Promise.all([socketUsuario(idUsu1), socketUsuario(idUsu2)])
          .then(([socketUsu1, socketUsu2]) => {
            if (socketUsu1 && socketUsu2) {
              io.to(socketUsu1).emit("match");
              io.to(socketUsu2).emit("match");
              console.log(`SocketId1: ${socketUsu1}, SocketId2: ${socketUsu2}`);
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
      }else{
        const noHabiaMatch = `INSERT INTO INTERACCIONES (idUsu1, idUsu2, tipoInteraccion) VALUES (${idUsu1}, ${idUsu2}, '${tipoInteraccion}')`;

        db.query(noHabiaMatch, (err, result) => {
          if (err) {
            console.error("Error en la consulta de inserción:", err);
            return res.status(500).json({ error: "Error al agregar el usuario" });
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
