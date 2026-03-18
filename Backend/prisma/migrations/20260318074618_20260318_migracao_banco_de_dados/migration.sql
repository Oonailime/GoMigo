/*
  Warnings:

  - A unique constraint covering the columns `[idPacoteViagem,idUserAutor,tipoAvaliacao]` on the table `tbAvaliacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPacoteViagem,idUser,statusSolicitacao]` on the table `tbSolicitacaoParticipacao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tipoAvaliacao` to the `tbAvaliacao` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipoPacoteViagem` on the `tbPacoteViagem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoPacoteViagem" AS ENUM ('ROTEIRO_COMPLETO', 'COMPARTILHADO', 'BATE_VOLTA', 'APENAS_CARONA', 'APENAS_HOSPEDAGEM', 'APENAS_GUIA_TURISTICO');

-- CreateEnum
CREATE TYPE "TipoAvaliacao" AS ENUM ('PACOTE', 'ORGANIZADOR', 'VIAJANTE');

-- AlterTable
ALTER TABLE "tbAvaliacao" ADD COLUMN     "tipoAvaliacao" "TipoAvaliacao" NOT NULL;

-- AlterTable
ALTER TABLE "tbPacoteViagem" DROP COLUMN "tipoPacoteViagem",
ADD COLUMN     "tipoPacoteViagem" "TipoPacoteViagem" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbAvaliacao_idPacoteViagem_idUserAutor_tipoAvaliacao_key" ON "tbAvaliacao"("idPacoteViagem", "idUserAutor", "tipoAvaliacao");

-- CreateIndex
CREATE UNIQUE INDEX "tbSolicitacaoParticipacao_idPacoteViagem_idUser_statusSolic_key" ON "tbSolicitacaoParticipacao"("idPacoteViagem", "idUser", "statusSolicitacao");
