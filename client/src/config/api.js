// Configurações da API
const API_CONFIG = {
  // URL base da API - pode ser configurada via variável de ambiente
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Timeout para requisições (em ms)
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Endpoints da API
  ENDPOINTS: {
    HISTORICO: {
      BASE: '/api/historico-lavagens',
      BY_USUARIO: (userId) => `/api/historico-lavagens/usuario/${userId}`,
      BY_LAVANDERIA: (lavanderiaId) => `/api/historico-lavagens/lavanderia/${lavanderiaId}`,
    },
    USUARIOS: '/api/usuarios',
    LAVANDERIAS: '/api/lavanderias',
    MAQUINAS: '/api/maquinas',
  },
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
  },
  
  // Mensagens de erro padrão
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Usuário não autorizado. Faça login novamente.',
    FORBIDDEN: 'Acesso negado.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro interno do servidor.',
    TIMEOUT: 'Tempo limite excedido.',
    UNKNOWN: 'Erro desconhecido.',
  }
};

export default API_CONFIG;
