const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3745;
const CryptoJS = require("crypto-js");

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

app.get("/users/nearby", (req, res) => {
  const currentLatitude = parseFloat(req.query.latitude);
  const currentLongitude = parseFloat(req.query.longitude);
  const radiusInKm = parseFloat(req.query.radius) * 10 || 10.0;

  console.log("currentLatitude:", currentLatitude);
  console.log("currentLongitude:", currentLongitude);
  console.log("radiusInKm:", radiusInKm);

  //   const query = `
  //         SELECT idUsu, nombreUsu,
  //             ST_X(ubiUsu) AS latitude,
  //             ST_Y(ubiUsu) AS longitude,
  //             ST_DISTANCE_SPHERE(ubiUsu, ST_GeomFromText('POINT(${currentLongitude} ${currentLatitude})', 4326))/1000 AS distance
  //         FROM USUARIO
  //         HAVING distance <= ${radiusInKm}
  //     `;

  const query = `
    SELECT 
        U.idUsu, 
        U.nombreUsu, 
        ST_X(U.ubiUsu) AS latitude, 
        ST_Y(U.ubiUsu) AS longitude,
        ST_DISTANCE_SPHERE(U.ubiUsu, ST_GeomFromText('POINT(${currentLongitude} ${currentLatitude})', 4326))/1000 AS distance,
        M.nombre AS nombreMascota,
        M.edad AS edadMascota,
        M.sexo AS sexoMascota,
        M.foto AS fotoMascota,
        M.descripcion AS descripcionMascota,
        M.relacionHumanos AS relacionHumanosMascota,
        M.relacionMascotas AS relacionMascotasMascota
    FROM USUARIO U
    LEFT JOIN MASCOTA M ON U.idUsu = M.idHumano
    HAVING distance <= ${radiusInKm}
  `;

  console.log(query);

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error en la consulta de usuarios cercanos" });
    } else {
      console.log(results);
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

  const location = `POINT(${longitude} ${latitude})`;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen en el servidor

  console.log("Ubicación:", location);
  console.log("Imagen:", imageUrl);

  const query = `
    INSERT INTO USUARIO (nombreUsu, ubiUsu, apellidosUsu, mailUsu, pass, genero, edad) VALUES (?, ST_GeomFromText(?), (?), (?), ?, ?, ?)
`;
  const values = [name, location, surname, mailUsu, pass, gender, age];

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
          res.json({ success: true, userId: result.insertId });
        }
      });
    }
  });
});

app.get("/pass", (req, res) => {
  const pass = req.body.pass;

  res.send(CryptoJS.MD5(pass).toString());
});

app.post("/login", (req, res) => {
  const { mailUsu, passUsu } = req.body;
  console.log("mailUsu: ", mailUsu);
  console.log("passUsu: ", passUsu);

  if (!mailUsu || !passUsu) {
    console.log("Faltan datos obligatorios");
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  } else {
    const sql = `SELECT * FROM USUARIO WHERE mailUsu = ?`;

    db.query(sql, mailUsu, (err, result) => {
      if (err) {
        console.error("Error en la consulta de inserción:", err);
        res.status(500).json({ error: "Error al agregar el usuario" });
      } else {
        console.log(result);
        let pass = CryptoJS.MD5(passUsu).toString();
        console.log("Introducida: ", pass);
        console.log("Correcta: ", result[0].pass);
        if (res == 0 || result[0].pass != pass) {
          console.log("Usuario o contraseña incorrectos");
          res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        } else {
          res.json({ result });
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

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
