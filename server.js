const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3745;

const db = mysql.createPool({
    host: 'dam.inspedralbes.cat',
    user: 'a22oscmungar_doginder',
    password: 'Doginder2023',
    database: 'a22oscmungar_doginder',
    connectionLimit: 100, 
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  

app.get('/users/nearby', (req, res) => {
    const currentLatitude = parseFloat(req.query.latitude);
    const currentLongitude = parseFloat(req.query.longitude);
    const radiusInKm = parseFloat(req.query.radius) * 10 || 10.0;

    const query = `
        SELECT idUsu, nombreUsu, 
            ST_X(ubiUsu) AS latitude, 
            ST_Y(ubiUsu) AS longitude,
            ST_DISTANCE_SPHERE(ubiUsu, ST_GeomFromText('POINT(${currentLongitude} ${currentLatitude})', 4326)) AS distance,
            imageUrl
        FROM USUARIO
        HAVING distance <= ${radiusInKm}
    `;

    console.log(query);

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error en la consulta de usuarios cercanos' });
        } else {
            res.json(results);
        }
    });
});

// Ruta para agregar un nuevo usuario
app.post('/users', upload.single('imagenFile'), (req, res) => {
    console.log('Recibiendo solicitud POST en /users');

    // Imprimir el cuerpo de la solicitud
    console.log('Cuerpo de la solicitud:', req.body);
    const { name, latitude, longitude, surname, mailUsu } = req.body;

    console.log("name: ", name);
    console.log("latitude: ", latitude);
    console.log("longitude: ", longitude);
    console.log("surname: ", surname);
    console.log("mailUsu: ", mailUsu);

    if (!name || !latitude || !longitude || !surname || !mailUsu) {
        console.log('Faltan datos obligatorios');
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    
    const location = `POINT(${longitude} ${latitude})`;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Ruta de la imagen en el servidor

    console.log('Ubicación:', location);
    console.log('Imagen:', imageUrl);

    const query = `
    INSERT INTO USUARIO (nombreUsu, ubiUsu, apellidosUsu, mailUsu, imageUrl) VALUES (?, ST_GeomFromText(?), (?), (?), ?)
`;
    const values = [name, location, surname, mailUsu, imageUrl];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error en la consulta de inserción:', err);
            res.status(500).json({ error: 'Error al agregar el usuario' });
        } else {
            res.json({ success: true, userId: result.insertId });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});