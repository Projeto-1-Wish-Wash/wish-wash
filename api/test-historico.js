const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

// Simular dados de histórico
let historicoData = [
  {
    id: 1,
    usuario_id: 1,
    lavanderia_id: 1,
    maquina_id: 1,
    data: new Date(),
    tipo: "Lavagem e Secagem",
    status: "Concluída",
    valor: 15.50,
    usuario: { id: 1, nome: "João Silva", email: "joao@email.com" },
    lavanderia: { id: 1, nome: "Lavanderia Central" },
    maquina: { id: 1, nome: "Máquina 01" }
  },
  {
    id: 2,
    usuario_id: 1,
    lavanderia_id: 2,
    maquina_id: 3,
    data: new Date(Date.now() - 86400000), // 1 dia atrás
    tipo: "Lavagem",
    status: "Concluída",
    valor: 12.00,
    usuario: { id: 1, nome: "João Silva", email: "joao@email.com" },
    lavanderia: { id: 2, nome: "Lavanderia Express" },
    maquina: { id: 3, nome: "Máquina 03" }
  }
];

// Endpoint para criar histórico
app.post('/api/historico-lavagens', (req, res) => {
  try {
    const { usuario_id, lavanderia_id, maquina_id, tipo, status, valor } = req.body;
    
    if (!usuario_id || !lavanderia_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios: usuario_id e lavanderia_id'
      });
    }

    const novoHistorico = {
      id: historicoData.length + 1,
      usuario_id: parseInt(usuario_id),
      lavanderia_id: parseInt(lavanderia_id),
      maquina_id: maquina_id ? parseInt(maquina_id) : null,
      data: new Date(),
      tipo: tipo || "Lavagem",
      status: status || "Em andamento",
      valor: valor ? parseFloat(valor) : null,
      usuario: { id: usuario_id, nome: "Usuário Teste", email: "teste@email.com" },
      lavanderia: { id: lavanderia_id, nome: "Lavanderia Teste" },
      maquina: maquina_id ? { id: maquina_id, nome: "Máquina Teste" } : null
    };

    historicoData.push(novoHistorico);

    res.status(201).json({
      message: 'Histórico criado com sucesso',
      historico: novoHistorico
    });
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para listar histórico por usuário
app.get('/api/historico-lavagens/usuario/:usuarioId', (req, res) => {
  try {
    const { usuarioId } = req.params;
    const historicos = historicoData.filter(h => h.usuario_id === parseInt(usuarioId));

    res.status(200).json({
      historico: historicos,
      total: historicos.length
    });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para listar histórico por lavanderia
app.get('/api/historico-lavagens/lavanderia/:lavanderiaId', (req, res) => {
  try {
    const { lavanderiaId } = req.params;
    const historicos = historicoData.filter(h => h.lavanderia_id === parseInt(lavanderiaId));

    res.status(200).json({
      historico: historicos,
      total: historicos.length
    });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para listar todos os históricos
app.get('/api/historico-lavagens', (req, res) => {
  try {
    res.status(200).json({
      historico: historicoData,
      total: historicoData.length
    });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor de teste rodando em http://localhost:${port}`);
  console.log('Endpoints disponíveis:');
  console.log('POST /api/historico-lavagens - Criar histórico');
  console.log('GET /api/historico-lavagens/usuario/:id - Listar por usuário');
  console.log('GET /api/historico-lavagens/lavanderia/:id - Listar por lavanderia');
  console.log('GET /api/historico-lavagens - Listar todos');
});
