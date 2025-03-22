# Image officielle Node.js
FROM node:20.18.0

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et lock
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie tout le projet
COPY . .

# Port exposé (à adapter selon ton app)
EXPOSE 3000

# Lancement de l'app
CMD ["node", "index.js"]
