-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('cliente', 'proprietario');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo_usuario" "public"."UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lavanderias" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "telefone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proprietario_id" INTEGER NOT NULL,

    CONSTRAINT "lavanderias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cartoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "numero" VARCHAR(19) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "validade" VARCHAR(5) NOT NULL,
    "cvv" VARCHAR(4) NOT NULL,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cartoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- AddForeignKey
ALTER TABLE "public"."lavanderias" ADD CONSTRAINT "lavanderias_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
