export function createAddressData(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  const [cidadePart, estadoPart] = value.split(' - ');
  return {
    rua: 'Nao informado',
    cep: '00000000',
    cidade: cidadePart?.trim() || value.trim(),
    estado: estadoPart?.trim() || 'Nao informado',
  };
}

export function formatCityLabel(value?: { cidade?: string | null; estado?: string | null } | null) {
  if (!value?.cidade) {
    return 'Local a definir';
  }

  if (!value.estado || value.estado === 'Nao informado') {
    return value.cidade;
  }

  return `${value.cidade} - ${value.estado}`;
}
