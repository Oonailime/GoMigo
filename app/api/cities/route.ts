import { NextRequest, NextResponse } from "next/server";
import { BRAZILIAN_CITY_FALLBACK } from "@/app/data/city-fallback";

type IbgeMunicipality = {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
};

type CityResult = {
  id: number;
  name: string;
  stateCode: string;
};

const IBGE_MUNICIPALITIES_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function GET(request: NextRequest) {
  const emptyCities: CityResult[] = [];
  const query = normalizeTerm(
    request.nextUrl.searchParams.get("query")?.trim() ?? "",
  );

  if (query.length < 2) {
    return NextResponse.json({ cities: emptyCities });
  }

  try {
    const response = await fetch(IBGE_MUNICIPALITIES_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error("Unable to load remote cities.");
    }

    const municipalities = (await response.json()) as IbgeMunicipality[];
    const cities = municipalities
      .filter((municipality) => normalizeTerm(municipality.nome).includes(query))
      .slice(0, 8)
      .map((municipality) => ({
        id: municipality.id,
        name: municipality.nome,
        stateCode: municipality.microrregiao.mesorregiao.UF.sigla,
      }));

    return NextResponse.json({ cities });
  } catch {
    const cities = BRAZILIAN_CITY_FALLBACK.filter((city) =>
      normalizeTerm(city.name).includes(query),
    ).slice(0, 8);

    return NextResponse.json({ cities, fallback: true });
  }
}
