# Integração do Histórico de Lavagens - WishWash

## 📋 Visão Geral

Este documento descreve a integração completa entre frontend e backend para a funcionalidade de histórico de lavagens no sistema WishWash.

## 🏗️ Arquitetura

### Backend (API)
- **Schema Prisma**: Modelo `HistoricoLavagem` com relacionamentos
- **Controller**: `historicoController.js` - lógica de negócio
- **Service**: `historicoService.js` - operações de banco de dados
- **Routes**: `historicoRoutes.js` - endpoints da API
- **Middleware**: Autenticação JWT obrigatória para consultas

### Frontend (React)
- **Página**: `History.js` - interface do usuário
- **Serviço**: `historicoService.js` - comunicação com API
- **Componente**: `LavagemSimulator.js` - simulação de lavagens
- **Configuração**: `api.js` - configurações centralizadas

## 🚀 Funcionalidades

### 1. Visualização de Histórico
- Lista todas as lavagens do usuário autenticado
- Filtros por usuário e lavanderia
- Ordenação por data (mais recente primeiro)
- Informações completas: lavanderia, máquina, tipo, status, valor

### 2. Criação de Histórico
- Formulário para simular conclusão de lavagem
- Validação de campos obrigatórios
- Integração automática com a API
- Atualização em tempo real da lista

### 3. Autenticação e Segurança
- Token JWT obrigatório para todas as operações
- Usuário só acessa seu próprio histórico
- Validação de permissões no backend

## 📡 Endpoints da API

### GET `/api/historico-lavagens/usuario/:id`
- **Descrição**: Busca histórico de um usuário específico
- **Autenticação**: Obrigatória (Bearer Token)
- **Resposta**: Array de registros de histórico

### POST `/api/historico-lavagens`
- **Descrição**: Cria novo registro de histórico
- **Autenticação**: Obrigatória (Bearer Token)
- **Body**: 
  ```json
  {
    "usuario_id": 1,
    "lavanderia_id": 1,
    "maquina_id": 1,
    "tipo": "Lavagem e Secagem",
    "status": "Concluída",
    "valor": 15.50
  }
  ```

### GET `/api/historico-lavagens/lavanderia/:id`
- **Descrição**: Busca histórico de uma lavanderia
- **Autenticação**: Obrigatória (Bearer Token)
- **Resposta**: Array de registros da lavanderia

## 🎯 Como Usar

### 1. Configuração do Ambiente
```bash
# Backend
cd api
npm install
npx prisma generate
npm start

# Frontend
cd client
npm install
npm start
```

### 2. Teste da Funcionalidade
1. Acesse a página de histórico (`/history`)
2. Use o simulador para criar uma lavagem
3. Veja a lista atualizada em tempo real
4. Teste diferentes tipos de serviço e valores

### 3. Dados de Teste
```javascript
// Exemplo de criação de histórico
const lavagemData = {
  usuario_id: 1,
  lavanderia_id: 1,
  maquina_id: 1,
  tipo: "Lavagem e Secagem",
  valor: 18.50
};

await HistoricoService.simularLavagemConcluida(lavagemData, token);
```

## 🔧 Configurações

### Variáveis de Ambiente
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/wishwash"
JWT_SECRET="your_secret_key"
```

### Banco de Dados
- **PostgreSQL** com Prisma ORM
- **Migrations** automáticas para o schema
- **Relacionamentos** configurados corretamente

## 📱 Interface do Usuário

### Componentes Principais
1. **Header**: Título e botão de fechar
2. **Simulador**: Formulário para criar lavagens
3. **Lista**: Cards com informações das lavagens
4. **Responsivo**: Adaptado para mobile e desktop

### Estados da Interface
- **Loading**: Carregando dados
- **Error**: Exibição de erros
- **Empty**: Sem histórico disponível
- **Success**: Dados carregados com sucesso

## 🧪 Testes

### Teste Automatizado
```bash
cd api
node test-historico.js
```

### Teste Manual
1. Crie uma lavagem via simulador
2. Verifique se aparece na lista
3. Teste diferentes cenários de erro
4. Valide responsividade

## 🚨 Tratamento de Erros

### Frontend
- Mensagens de erro amigáveis
- Fallbacks para dados ausentes
- Validação de formulários
- Feedback visual para ações

### Backend
- Validação de dados de entrada
- Tratamento de exceções
- Logs detalhados
- Códigos de status HTTP apropriados

## 🔄 Fluxo de Dados

1. **Usuário** acessa página de histórico
2. **Frontend** verifica autenticação
3. **API** valida token e busca dados
4. **Banco** retorna registros filtrados
5. **Frontend** renderiza lista atualizada
6. **Usuário** pode criar novas lavagens
7. **Lista** atualiza em tempo real

## 📈 Próximos Passos

### Melhorias Sugeridas
- [ ] Filtros avançados (por data, tipo, valor)
- [ ] Paginação para grandes volumes
- [ ] Exportação de dados (PDF, CSV)
- [ ] Notificações push para novas lavagens
- [ ] Dashboard com estatísticas
- [ ] Integração com sistema de pagamentos

### Manutenção
- [ ] Monitoramento de performance
- [ ] Logs de auditoria
- [ ] Backup automático do histórico
- [ ] Versionamento da API

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Teste os endpoints individualmente
3. Valide a configuração do banco
4. Consulte a documentação do Prisma

---

**Desenvolvido por**: Raphael Ramos  
**Data**: Agosto 2025  
**Versão**: 1.0.0
