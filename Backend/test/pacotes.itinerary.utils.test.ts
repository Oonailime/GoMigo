import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  buildItineraryTimeline,
  mapAtividadesForItinerary,
  mapCaronasForItinerary,
  mapHospedagensForItinerary,
  mapRoteiroHeader,
} from '../src/pacotes/pacotes.itinerary.utils';

test('mapRoteiroHeader applies safe defaults when the roteiro is missing', () => {
  assert.deepEqual(mapRoteiroHeader(null), {
    id: null,
    titulo: 'Roteiro da viagem',
    descricao: null,
  });
});

test('mapCaronasForItinerary formats addresses and dates for the response payload', () => {
  const result = mapCaronasForItinerary([
    {
      id: 1,
      enderecoPartida: { cidade: 'Salvador', estado: 'BA' },
      enderecoDestino: { cidade: 'Lençois', estado: 'Nao informado' },
      dataIda: new Date('2026-05-01T08:00:00.000Z'),
      dataVolta: new Date('2026-05-05T18:00:00.000Z'),
      precoPorPessoa: 120,
      regrasCarona: 'Sem atrasos',
      status: 'PLANEJADA',
    },
  ]);

  assert.deepEqual(result, [
    {
      id: 1,
      origem: 'Salvador - BA',
      destino: 'Lençois',
      dataIda: '2026-05-01T08:00:00.000Z',
      dataVolta: '2026-05-05T18:00:00.000Z',
      precoPorPessoa: 120,
      regrasCarona: 'Sem atrasos',
      status: 'PLANEJADA',
    },
  ]);
});

test('mapHospedagensForItinerary keeps fallback fields consistent', () => {
  const result = mapHospedagensForItinerary([
    {
      id: 2,
      nomeLocal: null,
      endereco: { cidade: 'Rio de Janeiro', estado: 'RJ' },
      dataCheckin: new Date('2026-05-01T14:00:00.000Z'),
      dataCheckout: new Date('2026-05-05T10:00:00.000Z'),
      precoPorPessoa: null,
      regrasHospedagem: 'Check-in na recepcao',
      statusReserva: 'CONFIRMADA',
    },
  ]);

  assert.deepEqual(result, [
    {
      id: 2,
      nomeLocal: null,
      local: 'Rio de Janeiro - RJ',
      dataCheckin: '2026-05-01T14:00:00.000Z',
      dataCheckout: '2026-05-05T10:00:00.000Z',
      precoPorPessoa: null,
      regrasHospedagem: 'Check-in na recepcao',
      statusReserva: 'CONFIRMADA',
    },
  ]);
});

test('mapAtividadesForItinerary maps categories to public enum values', () => {
  const result = mapAtividadesForItinerary([
    {
      id: 3,
      titulo: 'Almoco',
      descricao: 'Restaurante local',
      dataHoraInicio: new Date('2026-05-02T12:00:00.000Z'),
      dataHoraFim: new Date('2026-05-02T13:30:00.000Z'),
      preco: 50,
      endereco: { cidade: 'Rio de Janeiro', estado: 'RJ' },
      categoriaAtividade: { nome: 'Alimentacao' },
    },
    {
      id: 4,
      titulo: 'Passeio de barco',
      descricao: null,
      dataHoraInicio: new Date('2026-05-02T15:00:00.000Z'),
      dataHoraFim: new Date('2026-05-02T17:00:00.000Z'),
      preco: null,
      endereco: null,
      categoriaAtividade: { nome: 'Passeio/Turismo' },
    },
  ]);

  assert.deepEqual(result, [
    {
      id: 3,
      categoria: 'ALIMENTACAO',
      titulo: 'Almoco',
      descricao: 'Restaurante local',
      dataHoraInicio: '2026-05-02T12:00:00.000Z',
      dataHoraFim: '2026-05-02T13:30:00.000Z',
      preco: 50,
      local: 'Rio de Janeiro - RJ',
    },
    {
      id: 4,
      categoria: 'PASSEIO_TURISMO',
      titulo: 'Passeio de barco',
      descricao: null,
      dataHoraInicio: '2026-05-02T15:00:00.000Z',
      dataHoraFim: '2026-05-02T17:00:00.000Z',
      preco: null,
      local: null,
    },
  ]);
});

test('buildItineraryTimeline sorts mixed entries by start date and keeps fallbacks', () => {
  const result = buildItineraryTimeline(
    [
      {
        id: 1,
        enderecoPartida: { cidade: 'Salvador', estado: 'BA' },
        enderecoDestino: { cidade: 'Morro de Sao Paulo', estado: 'BA' },
        dataIda: new Date('2026-05-01T08:00:00.000Z'),
        dataVolta: new Date('2026-05-01T12:00:00.000Z'),
        regrasCarona: 'Saida cedo',
        status: 'PLANEJADA',
      },
    ],
    [
      {
        id: 2,
        nomeLocal: 'Pousada Azul',
        endereco: { cidade: 'Morro de Sao Paulo', estado: 'BA' },
        dataCheckin: new Date('2026-05-01T14:00:00.000Z'),
        dataCheckout: new Date('2026-05-03T10:00:00.000Z'),
        regrasHospedagem: 'Levar documento',
        statusReserva: 'CONFIRMADA',
      },
    ],
    [
      {
        id: 3,
        titulo: 'Jantar',
        descricao: 'Restaurante central',
        dataHoraInicio: new Date('2026-05-01T20:00:00.000Z'),
        dataHoraFim: new Date('2026-05-01T22:00:00.000Z'),
        endereco: null,
        categoriaAtividade: { nome: 'Alimentacao' },
      },
    ],
  );

  assert.deepEqual(result.map((item) => item.kind), ['CARONA', 'HOSPEDAGEM', 'ALIMENTACAO']);
  assert.equal(result[0]?.title, 'Salvador - BA -> Morro de Sao Paulo - BA');
  assert.equal(result[1]?.subtitle, 'Morro de Sao Paulo - BA');
  assert.equal(result[2]?.subtitle, 'Restaurante central');
});
