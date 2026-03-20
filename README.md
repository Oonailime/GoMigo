# GoMigo

GoMigo e um SaaS de organizacao de viagens em grupo. A ideia central e unir pessoas com interesses e destinos em comum para dividir custos e reduzir a friccao do planejamento, partindo do Brasil e com espaco para expansao futura.

## Ideia do app

Um marketplace + painel de organizacao onde:

- organizadores publicam pacotes de viagem (rota, datas, vagas, regras e custos estimados);
- viajantes buscam pacotes, enviam solicitacoes e entram no grupo aprovado;
- a viagem vira um hub com caronas, hospedagens, roteiros e combinacoes do grupo;
- o fluxo cobre desde viagens completas ate formatos menores (apenas carona ou apenas hospedagem).

## Como o produto se diferencia

- Agrupa tudo em um unico fluxo: rota, hospedagem, passeios e acordos do grupo.
- Usa a logica de viagens compartilhadas para reduzir custo por pessoa.
- Permite publicar pacotes gratuitos para gerar tracao e comunidades locais.

## O que ja esta modelado/implementado no repo

Backend (NestJS + Prisma + Postgres):

- Modulos ativos: usuarios, auth, enderecos, veiculos, pacotes, caronas, hospedagens,
  anuncios, solicitacoes de participacao e avaliacoes.
- Modelo de dados amplo para evoluir: roteiros/atividades, checklists, anexos,
  convites, pagamentos/ rateios, mensagens, cobrancas, denuncias e bloqueios.

Frontend (Next.js):

- Landing page com pitch e busca rapida.
- Login com Google e fluxo de completar perfil.
- Busca de pacotes publicados com filtros e paginacao.
- Criacao/edicao de pacotes e painel de "minhas viagens".

## Visao de longo prazo

Construir o principal hub para viagens em grupo no Brasil, conectando viajantes,
organizadores e parceiros locais em um unico ecossistema de pacotes e experiencias.

