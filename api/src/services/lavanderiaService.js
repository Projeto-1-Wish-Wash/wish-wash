const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');

class LavanderiaService {
  /**
   * Creates a new owner user and their laundry in a single transaction.
   */
  async createProprietarioComLavanderia(userData, laundryData) {
    const result = await prisma.$transaction(async (tx) => {
      // Encrypt user password
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(userData.senha, salt);

      // Create the owner user
      // Use 'tx' instead of prisma to ensure the operation
      // is part of the transaction
      const newOwner = await tx.usuario.create({
        data: {
          nome: userData.nome,
          email: userData.email,
          senha_hash: senha_hash,
          tipo_usuario: 'proprietario', // Force correct type
        },
      });

      // Use the newly created owner ID to create the laundry
      const newLaundry = await tx.lavanderia.create({
        data: {
          nome: laundryData.nome,
          endereco: laundryData.endereco,
          telefone: laundryData.telefone,
          proprietario_id: newOwner.id, // Link with owner
        },
      });

      // Return created data
      return { proprietario: newOwner, lavanderia: newLaundry };
    });

    // Prisma ensures that if any step above fails, everything is rolled back
    return result;
  }

  // READ: List all laundries
  async getAllLavanderias() {
    const laundries = await prisma.lavanderia.findMany({
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
    return laundries;
  }

  // READ: Find laundry by ID
  async getLavanderiaById(id) {
    const laundry = await prisma.lavanderia.findUnique({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo_usuario: true,
          },
        },
      },
    });
    return laundry;
  }

  // READ: Find laundries by owner
  async getLavanderiasByProprietario(proprietarioId) {
    const laundries = await prisma.lavanderia.findMany({
      where: { proprietario_id: parseInt(proprietarioId) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
    return laundries;
  }

  // UPDATE: Update laundry
  async updateLavanderia(id, { nome, endereco, telefone }) {
    const dataToUpdate = {};
    
    if (nome) dataToUpdate.nome = nome;
    if (endereco !== undefined) dataToUpdate.endereco = endereco; // allows empty string
    if (telefone !== undefined) dataToUpdate.telefone = telefone; // allows empty string

    const updatedLaundry = await prisma.lavanderia.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return updatedLaundry;
  }

  // DELETE: Delete laundry
  async deleteLavanderia(id) {
    // Check if laundry exists
    const laundry = await prisma.lavanderia.findUnique({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!laundry) {
      throw new Error('Laundry not found');
    }

    const deletedLaundry = await prisma.lavanderia.delete({
      where: { id: parseInt(id) },
      include: {
        proprietario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return deletedLaundry;
  }
}

module.exports = new LavanderiaService();