-- AlterTable
ALTER TABLE "public"."lavanderias" ADD COLUMN     "avaliacao" DOUBLE PRECISION,
ADD COLUMN     "horario" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "servicos" TEXT;

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
