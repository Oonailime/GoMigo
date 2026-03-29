import { UpsertRoteiroDto } from './dto/upsert-roteiro.dto';

export function collectSentEntityIds(items?: Array<{ id?: number }>) {
  return (items ?? []).flatMap((item) => (typeof item.id === 'number' ? [item.id] : []));
}

export function normalizeRoteiroMetadata(data: Pick<UpsertRoteiroDto, 'titulo' | 'descricao'>) {
  return {
    titulo: data.titulo?.trim() || 'Roteiro da viagem',
    descricao: data.descricao?.trim() || null,
  };
}

export function buildCaronaUpsertData(
  item: NonNullable<UpsertRoteiroDto['caronas']>[number],
  idPacoteViagem: number,
  idMotorista: number,
  idEnderecoPartida: number | null,
  idEnderecoDestino: number | null,
) {
  return {
    idPacoteViagem,
    idMotorista,
    dataIda: item.dataIda ? new Date(item.dataIda) : null,
    dataVolta: item.dataVolta ? new Date(item.dataVolta) : null,
    precoPorPessoa: item.precoPorPessoa ?? null,
    idEnderecoPartida,
    idEnderecoDestino,
    regrasCarona: item.regrasCarona?.trim() || 'Horarios e regras a combinar.',
    status: item.status?.trim() || 'PLANEJADA',
  };
}

export function buildHospedagemUpsertData(
  item: NonNullable<UpsertRoteiroDto['hospedagens']>[number],
  idPacoteViagem: number,
  idEndereco: number | null,
) {
  return {
    idPacoteViagem,
    idEndereco,
    nomeLocal: item.nomeLocal?.trim() || 'Hospedagem',
    dataCheckin: item.dataCheckin ? new Date(item.dataCheckin) : null,
    dataCheckout: item.dataCheckout ? new Date(item.dataCheckout) : null,
    precoPorPessoa: item.precoPorPessoa ?? null,
    regrasHospedagem: item.regrasHospedagem?.trim() || 'Regras da hospedagem a combinar.',
    statusReserva: item.statusReserva?.trim() || 'PLANEJADA',
  };
}

export function buildAtividadeUpsertData(
  item: NonNullable<UpsertRoteiroDto['atividades']>[number],
  idRoteiro: number,
  idCategoriaAtividade: number,
  idEndereco: number | null,
  ordem: number,
) {
  const titulo = item.titulo.trim();

  return {
    idRoteiro,
    idCategoriaAtividade,
    idEndereco,
    titulo,
    descricao: item.descricao?.trim() || titulo,
    dataHoraInicio: new Date(item.dataHoraInicio),
    dataHoraFim: new Date(item.dataHoraFim),
    ordem,
    preco: item.preco ?? null,
  };
}
