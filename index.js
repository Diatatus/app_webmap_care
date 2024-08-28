const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques dans le répertoire 'public'
app.use(express.static(path.join(__dirname, "public")));

// Configurer le dossier 'node_modules' pour être accessible publiquement
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// Serve loading.html as the default page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
