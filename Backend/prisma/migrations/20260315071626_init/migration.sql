-- CreateTable
CREATE TABLE "tbUser" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phoneNumber" VARCHAR(40) NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "dataCriacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbEndereco" (
    "id" SERIAL NOT NULL,
    "rua" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "numero" INTEGER,
    "complemento" TEXT,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,

    CONSTRAINT "tbEndereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbPlano" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "descricao" TEXT,
    "valorMensal" INTEGER NOT NULL,
    "valorAnual" INTEGER,
    "limitePacotesAtivos" INTEGER,
    "permiteDestaque" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL,

    CONSTRAINT "tbPlano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbAssinatura" (
    "id" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "idPlano" INTEGER NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "dataInicio" TIMESTAMPTZ(6) NOT NULL,
    "dataFim" TIMESTAMPTZ(6),
    "renovacaoAutomatica" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tbAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbPacoteViagem" (
    "id" SERIAL NOT NULL,
    "idOrganizador" INTEGER NOT NULL,
    "idEnderecoPartida" INTEGER NOT NULL,
    "idEnderecoDestino" INTEGER NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "descricao" TEXT,
    "tipoPacoteViagem" VARCHAR(30) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "vagas" INTEGER NOT NULL,
    "regrasViagem" TEXT NOT NULL,
    "valorTotalPrevisto" INTEGER,
    "valorPorPessoaPrevisto" INTEGER,
    "dataInicio" TIMESTAMPTZ(6),
    "dataFim" TIMESTAMPTZ(6),
    "privacidade" VARCHAR(30) NOT NULL,
    "dataCriacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbPacoteViagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbSolicitacaoParticipacao" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idUser" INTEGER NOT NULL,
    "statusSolicitacao" VARCHAR(30) NOT NULL,
    "mensagemSolicitacao" TEXT,
    "motivoRecusa" TEXT,
    "dataSolicitacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMPTZ(6),

    CONSTRAINT "tbSolicitacaoParticipacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbViajante" (
    "idPacoteViagem" INTEGER NOT NULL,
    "idUser" INTEGER NOT NULL,
    "statusParticipacao" VARCHAR(30) NOT NULL,
    "permissao" VARCHAR(30) NOT NULL,
    "dataEntrada" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbViajante_pkey" PRIMARY KEY ("idPacoteViagem","idUser")
);

-- CreateTable
CREATE TABLE "tbVeiculo" (
    "id" SERIAL NOT NULL,
    "idUserProprietario" INTEGER NOT NULL,
    "marca" VARCHAR(50) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "cor" VARCHAR(30),
    "placa" VARCHAR(10) NOT NULL,
    "ano" INTEGER,
    "capacidadePassageiros" INTEGER NOT NULL,

    CONSTRAINT "tbVeiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbCarona" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idVeiculo" INTEGER,
    "idMotorista" INTEGER NOT NULL,
    "dataIda" TIMESTAMPTZ(6),
    "dataVolta" TIMESTAMPTZ(6),
    "precoTotal" INTEGER,
    "precoPorPessoa" INTEGER,
    "idEnderecoPartida" INTEGER,
    "idEnderecoDestino" INTEGER,
    "regrasCarona" TEXT NOT NULL,
    "vagasDisponiveis" INTEGER,
    "status" VARCHAR(30) NOT NULL,

    CONSTRAINT "tbCarona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbHospedagem" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idEndereco" INTEGER,
    "nomeLocal" VARCHAR(120),
    "dataCheckin" TIMESTAMPTZ(6),
    "dataCheckout" TIMESTAMPTZ(6),
    "precoTotal" INTEGER,
    "precoPorPessoa" INTEGER,
    "regrasHospedagem" TEXT NOT NULL,
    "statusReserva" VARCHAR(30) NOT NULL,

    CONSTRAINT "tbHospedagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbQuarto" (
    "id" SERIAL NOT NULL,
    "idHospedagem" INTEGER NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "tipoQuarto" VARCHAR(30),
    "preco" INTEGER,
    "descricao" TEXT,

    CONSTRAINT "tbQuarto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbReservaHospedagem" (
    "id" SERIAL NOT NULL,
    "idHospedagem" INTEGER NOT NULL,
    "idQuarto" INTEGER,
    "idUser" INTEGER NOT NULL,
    "statusReserva" VARCHAR(30) NOT NULL,
    "valorIndividual" INTEGER,
    "dataReserva" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbReservaHospedagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbCategoriaAtividade" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "tbCategoriaAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbRoteiro" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "descricao" TEXT,
    "precoTotal" INTEGER,

    CONSTRAINT "tbRoteiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbAtividade" (
    "id" SERIAL NOT NULL,
    "idRoteiro" INTEGER NOT NULL,
    "idCategoriaAtividade" INTEGER,
    "idEndereco" INTEGER,
    "titulo" VARCHAR(120) NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataHoraInicio" TIMESTAMPTZ(6) NOT NULL,
    "dataHoraFim" TIMESTAMPTZ(6) NOT NULL,
    "ordem" INTEGER,
    "preco" INTEGER,

    CONSTRAINT "tbAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbChecklistPacote" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "tbChecklistPacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbItemChecklistPacote" (
    "id" SERIAL NOT NULL,
    "idChecklistPacote" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "statusItem" VARCHAR(30) NOT NULL,
    "idResponsavel" INTEGER,
    "prazo" TIMESTAMPTZ(6),

    CONSTRAINT "tbItemChecklistPacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbAnexo" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER,
    "idAtividade" INTEGER,
    "idHospedagem" INTEGER,
    "idUser" INTEGER NOT NULL,
    "nomeArquivo" VARCHAR(255) NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "tipoArquivo" VARCHAR(50) NOT NULL,
    "dataUpload" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbAnexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbHistoricoStatusPacote" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "statusAnterior" VARCHAR(30),
    "statusNovo" VARCHAR(30) NOT NULL,
    "motivo" TEXT,
    "idUserResponsavel" INTEGER NOT NULL,
    "dataAlteracao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbHistoricoStatusPacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbConvite" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idUserRemetente" INTEGER NOT NULL,
    "idUserDestinatario" INTEGER,
    "emailDestinatario" VARCHAR(80),
    "telefoneDestinatario" VARCHAR(40),
    "statusConvite" VARCHAR(30) NOT NULL,
    "tokenConvite" VARCHAR(120) NOT NULL,
    "dataEnvio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMPTZ(6),

    CONSTRAINT "tbConvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbPagamento" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idUserPagador" INTEGER NOT NULL,
    "tipoPagamento" VARCHAR(30) NOT NULL,
    "statusPagamento" VARCHAR(30) NOT NULL,
    "valor" INTEGER NOT NULL,
    "metodoPagamento" VARCHAR(30) NOT NULL,
    "referenciaExterna" VARCHAR(120),
    "dataCriacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMPTZ(6),

    CONSTRAINT "tbPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbRateio" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idUser" INTEGER NOT NULL,
    "descricao" VARCHAR(120) NOT NULL,
    "valorPrevisto" INTEGER NOT NULL,
    "valorPago" INTEGER,
    "statusRateio" VARCHAR(30) NOT NULL,

    CONSTRAINT "tbRateio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbMensagem" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idUserRemetente" INTEGER NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dataEnvio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbAvaliacao" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER,
    "idUserAutor" INTEGER NOT NULL,
    "idUserAvaliado" INTEGER,
    "idCarona" INTEGER,
    "idHospedagem" INTEGER,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "dataAvaliacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbCobrancaPlataforma" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idOrganizador" INTEGER NOT NULL,
    "tipoCobranca" VARCHAR(30) NOT NULL,
    "statusCobranca" VARCHAR(30) NOT NULL,
    "valor" INTEGER NOT NULL,
    "dataCriacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMPTZ(6),

    CONSTRAINT "tbCobrancaPlataforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbAnuncioPacote" (
    "id" SERIAL NOT NULL,
    "idPacoteViagem" INTEGER NOT NULL,
    "idOrganizador" INTEGER NOT NULL,
    "tituloAnuncio" VARCHAR(120) NOT NULL,
    "descricaoAnuncio" TEXT,
    "statusAnuncio" VARCHAR(30) NOT NULL,
    "orcamento" INTEGER,
    "dataInicio" TIMESTAMPTZ(6),
    "dataFim" TIMESTAMPTZ(6),

    CONSTRAINT "tbAnuncioPacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbDocumentoVerificacao" (
    "id" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "tipoDocumento" VARCHAR(30) NOT NULL,
    "numeroDocumento" VARCHAR(80),
    "urlArquivo" TEXT,
    "statusVerificacao" VARCHAR(30) NOT NULL,
    "dataEnvio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAnalise" TIMESTAMPTZ(6),

    CONSTRAINT "tbDocumentoVerificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbDenuncia" (
    "id" SERIAL NOT NULL,
    "idUserAutor" INTEGER NOT NULL,
    "idUserDenunciado" INTEGER,
    "idPacoteViagem" INTEGER,
    "idMensagem" INTEGER,
    "motivo" VARCHAR(120) NOT NULL,
    "descricao" TEXT,
    "statusDenuncia" VARCHAR(30) NOT NULL,
    "dataCriacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbDenuncia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbBloqueioUsuario" (
    "id" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "statusBloqueio" VARCHAR(30) NOT NULL,
    "dataInicio" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMPTZ(6),
    "idUserResponsavel" INTEGER NOT NULL,

    CONSTRAINT "tbBloqueioUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbUser_cpf_key" ON "tbUser"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tbUser_phoneNumber_key" ON "tbUser"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tbUser_email_key" ON "tbUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbVeiculo_placa_key" ON "tbVeiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "tbCategoriaAtividade_nome_key" ON "tbCategoriaAtividade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tbConvite_tokenConvite_key" ON "tbConvite"("tokenConvite");

-- AddForeignKey
ALTER TABLE "tbAssinatura" ADD CONSTRAINT "tbAssinatura_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAssinatura" ADD CONSTRAINT "tbAssinatura_idPlano_fkey" FOREIGN KEY ("idPlano") REFERENCES "tbPlano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPacoteViagem" ADD CONSTRAINT "tbPacoteViagem_idOrganizador_fkey" FOREIGN KEY ("idOrganizador") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPacoteViagem" ADD CONSTRAINT "tbPacoteViagem_idEnderecoPartida_fkey" FOREIGN KEY ("idEnderecoPartida") REFERENCES "tbEndereco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPacoteViagem" ADD CONSTRAINT "tbPacoteViagem_idEnderecoDestino_fkey" FOREIGN KEY ("idEnderecoDestino") REFERENCES "tbEndereco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbSolicitacaoParticipacao" ADD CONSTRAINT "tbSolicitacaoParticipacao_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbSolicitacaoParticipacao" ADD CONSTRAINT "tbSolicitacaoParticipacao_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbViajante" ADD CONSTRAINT "tbViajante_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbViajante" ADD CONSTRAINT "tbViajante_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbVeiculo" ADD CONSTRAINT "tbVeiculo_idUserProprietario_fkey" FOREIGN KEY ("idUserProprietario") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCarona" ADD CONSTRAINT "tbCarona_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCarona" ADD CONSTRAINT "tbCarona_idVeiculo_fkey" FOREIGN KEY ("idVeiculo") REFERENCES "tbVeiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCarona" ADD CONSTRAINT "tbCarona_idMotorista_fkey" FOREIGN KEY ("idMotorista") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCarona" ADD CONSTRAINT "tbCarona_idEnderecoPartida_fkey" FOREIGN KEY ("idEnderecoPartida") REFERENCES "tbEndereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCarona" ADD CONSTRAINT "tbCarona_idEnderecoDestino_fkey" FOREIGN KEY ("idEnderecoDestino") REFERENCES "tbEndereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbHospedagem" ADD CONSTRAINT "tbHospedagem_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbHospedagem" ADD CONSTRAINT "tbHospedagem_idEndereco_fkey" FOREIGN KEY ("idEndereco") REFERENCES "tbEndereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbQuarto" ADD CONSTRAINT "tbQuarto_idHospedagem_fkey" FOREIGN KEY ("idHospedagem") REFERENCES "tbHospedagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbReservaHospedagem" ADD CONSTRAINT "tbReservaHospedagem_idHospedagem_fkey" FOREIGN KEY ("idHospedagem") REFERENCES "tbHospedagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbReservaHospedagem" ADD CONSTRAINT "tbReservaHospedagem_idQuarto_fkey" FOREIGN KEY ("idQuarto") REFERENCES "tbQuarto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbReservaHospedagem" ADD CONSTRAINT "tbReservaHospedagem_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbRoteiro" ADD CONSTRAINT "tbRoteiro_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAtividade" ADD CONSTRAINT "tbAtividade_idRoteiro_fkey" FOREIGN KEY ("idRoteiro") REFERENCES "tbRoteiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAtividade" ADD CONSTRAINT "tbAtividade_idCategoriaAtividade_fkey" FOREIGN KEY ("idCategoriaAtividade") REFERENCES "tbCategoriaAtividade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAtividade" ADD CONSTRAINT "tbAtividade_idEndereco_fkey" FOREIGN KEY ("idEndereco") REFERENCES "tbEndereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbChecklistPacote" ADD CONSTRAINT "tbChecklistPacote_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbItemChecklistPacote" ADD CONSTRAINT "tbItemChecklistPacote_idChecklistPacote_fkey" FOREIGN KEY ("idChecklistPacote") REFERENCES "tbChecklistPacote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbItemChecklistPacote" ADD CONSTRAINT "tbItemChecklistPacote_idResponsavel_fkey" FOREIGN KEY ("idResponsavel") REFERENCES "tbUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnexo" ADD CONSTRAINT "tbAnexo_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnexo" ADD CONSTRAINT "tbAnexo_idAtividade_fkey" FOREIGN KEY ("idAtividade") REFERENCES "tbAtividade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnexo" ADD CONSTRAINT "tbAnexo_idHospedagem_fkey" FOREIGN KEY ("idHospedagem") REFERENCES "tbHospedagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnexo" ADD CONSTRAINT "tbAnexo_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbHistoricoStatusPacote" ADD CONSTRAINT "tbHistoricoStatusPacote_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbHistoricoStatusPacote" ADD CONSTRAINT "tbHistoricoStatusPacote_idUserResponsavel_fkey" FOREIGN KEY ("idUserResponsavel") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbConvite" ADD CONSTRAINT "tbConvite_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbConvite" ADD CONSTRAINT "tbConvite_idUserRemetente_fkey" FOREIGN KEY ("idUserRemetente") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbConvite" ADD CONSTRAINT "tbConvite_idUserDestinatario_fkey" FOREIGN KEY ("idUserDestinatario") REFERENCES "tbUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPagamento" ADD CONSTRAINT "tbPagamento_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbPagamento" ADD CONSTRAINT "tbPagamento_idUserPagador_fkey" FOREIGN KEY ("idUserPagador") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbRateio" ADD CONSTRAINT "tbRateio_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbRateio" ADD CONSTRAINT "tbRateio_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbMensagem" ADD CONSTRAINT "tbMensagem_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbMensagem" ADD CONSTRAINT "tbMensagem_idUserRemetente_fkey" FOREIGN KEY ("idUserRemetente") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAvaliacao" ADD CONSTRAINT "tbAvaliacao_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAvaliacao" ADD CONSTRAINT "tbAvaliacao_idUserAutor_fkey" FOREIGN KEY ("idUserAutor") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAvaliacao" ADD CONSTRAINT "tbAvaliacao_idUserAvaliado_fkey" FOREIGN KEY ("idUserAvaliado") REFERENCES "tbUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAvaliacao" ADD CONSTRAINT "tbAvaliacao_idCarona_fkey" FOREIGN KEY ("idCarona") REFERENCES "tbCarona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAvaliacao" ADD CONSTRAINT "tbAvaliacao_idHospedagem_fkey" FOREIGN KEY ("idHospedagem") REFERENCES "tbHospedagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCobrancaPlataforma" ADD CONSTRAINT "tbCobrancaPlataforma_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbCobrancaPlataforma" ADD CONSTRAINT "tbCobrancaPlataforma_idOrganizador_fkey" FOREIGN KEY ("idOrganizador") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnuncioPacote" ADD CONSTRAINT "tbAnuncioPacote_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbAnuncioPacote" ADD CONSTRAINT "tbAnuncioPacote_idOrganizador_fkey" FOREIGN KEY ("idOrganizador") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDocumentoVerificacao" ADD CONSTRAINT "tbDocumentoVerificacao_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDenuncia" ADD CONSTRAINT "tbDenuncia_idUserAutor_fkey" FOREIGN KEY ("idUserAutor") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDenuncia" ADD CONSTRAINT "tbDenuncia_idUserDenunciado_fkey" FOREIGN KEY ("idUserDenunciado") REFERENCES "tbUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDenuncia" ADD CONSTRAINT "tbDenuncia_idPacoteViagem_fkey" FOREIGN KEY ("idPacoteViagem") REFERENCES "tbPacoteViagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbDenuncia" ADD CONSTRAINT "tbDenuncia_idMensagem_fkey" FOREIGN KEY ("idMensagem") REFERENCES "tbMensagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbBloqueioUsuario" ADD CONSTRAINT "tbBloqueioUsuario_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbBloqueioUsuario" ADD CONSTRAINT "tbBloqueioUsuario_idUserResponsavel_fkey" FOREIGN KEY ("idUserResponsavel") REFERENCES "tbUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
