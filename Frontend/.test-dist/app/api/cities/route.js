"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const city_fallback_1 = require("@/app/data/city-fallback");
const IBGE_MUNICIPALITIES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";
function normalizeTerm(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}
async function GET(request) {
    const emptyCities = [];
    const query = normalizeTerm(request.nextUrl.searchParams.get("query")?.trim() ?? "");
    if (query.length < 2) {
        return server_1.NextResponse.json({ cities: emptyCities });
    }
    try {
        const response = await fetch(IBGE_MUNICIPALITIES_URL, {
            next: { revalidate: 60 * 60 * 24 },
        });
        if (!response.ok) {
            throw new Error("Unable to load remote cities.");
        }
        const municipalities = (await response.json());
        const cities = municipalities
            .filter((municipality) => normalizeTerm(municipality.nome).includes(query))
            .slice(0, 8)
            .map((municipality) => ({
            id: municipality.id,
            name: municipality.nome,
            stateCode: municipality.microrregiao.mesorregiao.UF.sigla,
        }));
        return server_1.NextResponse.json({ cities });
    }
    catch {
        const cities = city_fallback_1.BRAZILIAN_CITY_FALLBACK.filter((city) => normalizeTerm(city.name).includes(query)).slice(0, 8);
        return server_1.NextResponse.json({ cities, fallback: true });
    }
}
