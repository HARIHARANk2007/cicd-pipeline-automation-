from fastapi import APIRouter, Query, Depends
from typing import List
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import quote
import json

from .auth import get_current_user

router = APIRouter()

COMMON_DRUGS = [
    "Aspirin", "Amiodarone", "Amoxicillin", "Atorvastatin", "Apixaban", "Albuterol", "Acetaminophen", "Amlodipine", "Alprazolam", "Azithromycin",
    "Clopidogrel", "Carvedilol", "Citalopram", "Clonazepam", "Cyclobenzaprine", "Celecoxib",
    "Dabigatran", "Dipyridamole", "Duloxetine", "Diazepam", "Digoxin", "Doxycycline",
    "Enoxaparin", "Edoxaban", "Escitalopram", "Erythromycin",
    "Fluoxetine", "Furosemide", "Fluticasone", "Fentanyl",
    "Gabapentin", "Glipizide", "Guaifenesin",
    "Heparin", "Hydrochlorothiazide", "Hydrocodone", "Ibuprofen", "Insulin", "Imatinib",
    "Lisinopril", "Levothyroxine", "Losartan", "Loratadine", "Lipitor",
    "Metformin", "Metoprolol", "Montelukast", "Meloxicam", "Methotrexate", "Morphine",
    "Naproxen", "Nexium", "Nitroglycerin",
    "Omeprazole", "Oxycodone", "Ondansetron",
    "Prasugrel", "Pravastatin", "Prednisone", "Pantoprazole", "Penicillin",
    "Rivaroxaban", "Rosuvastatin", "Ramipril",
    "Simvastatin", "Sertraline", "Spironolactone", "Synthroid",
    "Ticagrelor", "Tramadol", "Tamsulosin", "Trazodone",
    "Warfarin", "Warfarin Sodium", "Xarelto", "Zoloft"
]


def search_openfda_drugs(query: str) -> List[str]:
    if len(query) < 2:
        return []
    url = f"https://api.fda.gov/drug/label.json?search=(openfda.brand_name:{quote(query)}*+openfda.generic_name:{quote(query)}*)&limit=30"
    req = Request(url, headers={"User-Agent": "MediGuard-AI/1.0"})
    try:
        with urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
            results = data.get("results", [])
            names = set()
            for r in results:
                openfda = r.get("openfda", {})
                for name_list in (openfda.get("brand_name", []), openfda.get("generic_name", [])):
                    for name in name_list:
                        name_str = name.strip().title()
                        if query.lower() in name_str.lower():
                            names.add(name_str)
            return sorted(list(names))
    except Exception as e:
        print(f"openFDA search error: {e}")
        return []


@router.get("/drugs/search")
async def search_drugs(
    q: str = Query(..., description="Query string to search for drugs"),
    current_user: dict = Depends(get_current_user),
):
    query_clean = q.lower().strip()
    if not query_clean:
        return []

    local_matches = [d for d in COMMON_DRUGS if d.lower().startswith(query_clean)]
    if len(local_matches) < 10:
        local_substrings = [d for d in COMMON_DRUGS if query_clean in d.lower() and d not in local_matches]
        local_matches.extend(local_substrings)

    fda_matches = search_openfda_drugs(query_clean)

    seen = set()
    merged = []
    for item in local_matches + fda_matches:
        normalized = item.lower().strip()
        if len(item) > 60:
            continue
        if normalized not in seen:
            seen.add(normalized)
            merged.append(item)

    return merged[:15]
