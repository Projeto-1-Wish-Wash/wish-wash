/*
  Warnings:

  - You are about to drop the column `status` on the `historico_lavagens` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `historico_lavagens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."historico_lavagens" DROP COLUMN "status",
DROP COLUMN "tipo";
