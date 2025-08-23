-- CreateTable
CREATE TABLE "public"."solicitacoes_suporte" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_suporte_pkey" PRIMARY KEY ("id")
);
