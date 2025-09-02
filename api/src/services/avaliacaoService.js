const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AvaliacaoService {
  async criarAvaliacao(dados) {
    const { usuario_id, lavanderia_id, nota, comentario } = dados;

    const avaliacaoExistente = await prisma.avaliacaoLavanderia.findFirst({
      where: { usuario_id, lavanderia_id }
    });

    let avaliacao;

    if (avaliacaoExistente) {
      avaliacao = await prisma.avaliacaoLavanderia.update({
        where: { id: avaliacaoExistente.id },
        data: { nota, comentario, updatedAt: new Date() }
      });
    } else {
      avaliacao = await prisma.avaliacaoLavanderia.create({
        data: { usuario_id, lavanderia_id, nota, comentario }
      });
    }

    await this.atualizarAvaliacaoMedia(lavanderia_id);
    return avaliacao;
  }

  async buscarAvaliacaoUsuario(usuario_id, lavanderia_id) {
    return prisma.avaliacaoLavanderia.findFirst({ where: { usuario_id, lavanderia_id } });
  }

  async listarAvaliacoesLavanderia(lavanderia_id) {
    return prisma.avaliacaoLavanderia.findMany({
      where: { lavanderia_id },
      include: { usuario: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async atualizarAvaliacaoMedia(lavanderia_id) {
    const resultado = await prisma.avaliacaoLavanderia.aggregate({
      where: { lavanderia_id },
      _avg: { nota: true },
      _count: { nota: true }
    });

    const media = resultado._avg.nota || 0;
    await prisma.lavanderia.update({ where: { id: lavanderia_id }, data: { avaliacao: media } });
    return { media, totalAvaliacoes: resultado._count.nota || 0 };
  }

  async verificarUsoLavanderia(usuario_id, lavanderia_id) {
    const historico = await prisma.historicoLavagem.findFirst({ where: { usuario_id, lavanderia_id } });
    return !!historico;
  }

  async deletarAvaliacao(avaliacao_id, usuario_id) {
    const avaliacao = await prisma.avaliacaoLavanderia.findFirst({ where: { id: avaliacao_id, usuario_id } });
    if (!avaliacao) throw new Error('Avaliação não encontrada ou não autorizada');

    const lavanderia_id = avaliacao.lavanderia_id;
    await prisma.avaliacaoLavanderia.delete({ where: { id: avaliacao_id } });
    await this.atualizarAvaliacaoMedia(lavanderia_id);
    return { message: 'Avaliação deletada com sucesso' };
  }
}

module.exports = AvaliacaoService;
