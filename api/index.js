const express = require('express');
const cors = require('cors');
const routes = require('./src/routes'); // Importa o roteador principal

const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Monta todas as rotas 
app.use('/api', routes);

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor da API rodando em http://localhost:${port}`);
});