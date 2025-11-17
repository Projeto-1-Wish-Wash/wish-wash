# 🧼 Wish Wash

Wish Wash é um aplicativo mobile/web desenvolvido para ajudar usuários a encontrar lavanderias próximas com base na sua localização atual. O app mostra informações úteis como preço dos serviços, disponibilidade em tempo real (ocupado ou livre), além de permitir a navegação até a lavanderia desejada.

## ✨ Funcionalidades Principais

- 🗺️ **Mapa Interativo**: Visualize lavanderias próximas em um mapa com marcadores
- 📍 **Geolocalização**: Encontre lavanderias com base na sua localização atual
- 🔍 **Busca**: Pesquise lavanderias por nome ou endereço
- 🚗 **Navegação**: Trace rotas até a lavanderia escolhida
- 💰 **Preços**: Veja o valor de cada máquina antes de reservar
- ⏰ **Sistema de Reservas com Horário**: Reserve máquinas escolhendo um horário específico entre 8h e 18h
- 🔄 **Status em Tempo Real**: Veja quais máquinas estão disponíveis, em uso ou em manutenção
- ⭐ **Avaliações**: Avalie lavanderias após usar os serviços
- 📊 **Histórico**: Acompanhe todas as suas lavagens anteriores com data, horário e valores

## 🕐 Sistema de Reservas

O sistema de reservas permite que clientes selecionem um horário específico ao reservar uma máquina:

- **Horários Disponíveis**: 8:00h às 18:00h (horário comercial)
- **Slots de Tempo**: Cada slot tem duração de 1 hora
- **Interface Intuitiva**: Modal interativo com todos os horários disponíveis
- **Confirmação Imediata**: Reserva confirmada instantaneamente no sistema

## 🏗️ Estrutura do Projeto

```
wish-wash/
├── api/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/   # Lógica de controle das rotas
│   │   ├── services/      # Lógica de negócio
│   │   ├── routes/        # Definição de rotas da API
│   │   └── middleware/    # Autenticação e validações
│   └── prisma/
│       ├── schema.prisma  # Schema do banco de dados
│       └── migrations/    # Migrações do banco
│
└── client/                # Frontend React
    └── src/
        ├── pages/         # Páginas da aplicação
        └── components/    # Componentes reutilizáveis

```

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação

### Frontend
- React
- Leaflet (mapas interativos)
- React Router
- CSS3

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 16+
- PostgreSQL
- npm ou yarn

### Backend
```bash
cd api
npm install
npx prisma migrate dev
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

## 🔐 Tipos de Usuário

- **Cliente**: Pode buscar lavanderias, reservar máquinas com horário, visualizar histórico e avaliar serviços
- **Proprietário**: Pode cadastrar lavanderias, gerenciar máquinas e visualizar reservas

## 📝 Licença

Este projeto está sob licença MIT.
