-- CreateEnum
CREATE TYPE "public"."StatusMaquina" AS ENUM ('disponivel', 'em_uso', 'manutencao');

-- CreateTable
CREATE TABLE "public"."maquinas_de_lavar" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "public"."StatusMaquina" NOT NULL DEFAULT 'disponivel',
    "capacidade" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lavanderia_id" INTEGER NOT NULL,

    CONSTRAINT "maquinas_de_lavar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."maquinas_de_lavar" ADD CONSTRAINT "maquinas_de_lavar_lavanderia_id_fkey" FOREIGN KEY ("lavanderia_id") REFERENCES "public"."lavanderias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
