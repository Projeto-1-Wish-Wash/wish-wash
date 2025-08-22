const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e extrai as informações do usuário
 */
const authenticateToken = (req, res, next) => {
  // Busca o token no header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso necessário' 
    });
  }

  // Verifica o token
  jwt.verify(token, process.env.JWT_SECRET || 'wishwash_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido ou expirado' 
      });
    }

    // Adiciona os dados do usuário à requisição
    req.user = user;
    next();
  });
};

/**
 * Middleware para verificar se o usuário pode acessar seus próprios dados
 * Usado em rotas como GET/PUT/DELETE /usuarios/:id
 */
const verifyUserAccess = (req, res, next) => {
  const userIdFromToken = req.user.userId;
  const userIdFromParams = parseInt(req.params.id || req.params.proprietarioId);

  // Verifica se o usuário está tentando acessar seus próprios dados
  if (userIdFromToken !== userIdFromParams) {
    return res.status(403).json({ 
      error: 'Você só pode acessar seus próprios dados' 
    });
  }

  next();
};

/**
 * Middleware para verificar se o usuário é proprietário de uma lavanderia
 * Usado em rotas de UPDATE e DELETE de lavanderias
 */
const verifyLaundryOwnership = async (req, res, next) => {
  try {
    const userIdFromToken = req.user.userId;
    const laundryId = parseInt(req.params.id);
    
    // Buscar a lavanderia para verificar o proprietário
    const prisma = require('../../prisma/client');
    const lavanderia = await prisma.lavanderia.findUnique({
      where: { id: laundryId },
      select: { proprietario_id: true }
    });

    if (!lavanderia) {
      return res.status(404).json({ 
        error: 'Lavanderia não encontrada' 
      });
    }

    // Verifica se o usuário é o proprietário da lavanderia
    if (lavanderia.proprietario_id !== userIdFromToken) {
      return res.status(403).json({ 
        error: 'Você só pode alterar suas próprias lavanderias' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar propriedade da lavanderia:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  authenticateToken,
  verifyUserAccess,
  verifyLaundryOwnership
};
