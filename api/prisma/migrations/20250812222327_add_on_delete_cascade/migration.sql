-- DropForeignKey
ALTER TABLE "public"."lavanderias" DROP CONSTRAINT "lavanderias_proprietario_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."lavanderias" ADD CONSTRAINT "lavanderias_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
