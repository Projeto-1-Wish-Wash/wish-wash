-- CreateTable
CREATE TABLE "public"."historico_lavagens" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "lavanderia_id" INTEGER NOT NULL,
    "maquina_id" INTEGER,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT,
    "status" TEXT,
    "valor" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_lavagens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."historico_lavagens" ADD CONSTRAINT "historico_lavagens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historico_lavagens" ADD CONSTRAINT "historico_lavagens_lavanderia_id_fkey" FOREIGN KEY ("lavanderia_id") REFERENCES "public"."lavanderias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historico_lavagens" ADD CONSTRAINT "historico_lavagens_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "public"."maquinas_de_lavar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
