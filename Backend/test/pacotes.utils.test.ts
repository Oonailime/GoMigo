import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { createAddressData, formatCityLabel } from '../src/pacotes/pacotes.utils';

test('createAddressData returns null for empty values', () => {
  assert.equal(createAddressData(''), null);
  assert.equal(createAddressData('   '), null);
  assert.equal(createAddressData(undefined), null);
});

test('createAddressData parses city and state from the display label', () => {
  assert.deepEqual(createAddressData('Salvador - BA'), {
    rua: 'Nao informado',
    cep: '00000000',
    cidade: 'Salvador',
    estado: 'BA',
  });
});

test('createAddressData falls back to default state when it is omitted', () => {
  assert.deepEqual(createAddressData('Lençois'), {
    rua: 'Nao informado',
    cep: '00000000',
    cidade: 'Lençois',
    estado: 'Nao informado',
  });
});

test('formatCityLabel hides placeholder state values', () => {
  assert.equal(formatCityLabel({ cidade: 'Lençois', estado: 'Nao informado' }), 'Lençois');
  assert.equal(formatCityLabel({ cidade: 'Lençois', estado: null }), 'Lençois');
  assert.equal(formatCityLabel({ cidade: 'Lençois', estado: 'BA' }), 'Lençois - BA');
});

test('formatCityLabel uses a friendly fallback when city is missing', () => {
  assert.equal(formatCityLabel(undefined), 'Local a definir');
  assert.equal(formatCityLabel({ cidade: null, estado: 'BA' }), 'Local a definir');
});
