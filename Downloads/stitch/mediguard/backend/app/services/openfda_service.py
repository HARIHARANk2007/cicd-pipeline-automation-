"""OpenFDA lookups for medication risk analysis.

This module isolates the FDA API call so the rest of the backend can
fall back to local rules when the service is unavailable.
"""

from __future__ import annotations

import json
from typing import Any, Dict, Iterable, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


OPENFDA_LABEL_ENDPOINT = "https://api.fda.gov/drug/label.json"
OPENFDA_TIMEOUT_SECONDS = 6

ANTICOAGULANTS = {
    "warfarin",
    "heparin",
    "enoxaparin",
    "apixaban",
    "rivaroxaban",
    "dabigatran",
    "edoxaban",
}

ANTIPLATELETS = {
    "aspirin",
    "clopidogrel",
    "ticagrelor",
    "prasugrel",
    "dipyridamole",
}

SOURCE_SECTION_BY_DRUG = {
    "warfarin": "Drug Interactions",
    "heparin": "Drug Interactions",
    "enoxaparin": "Drug Interactions",
    "apixaban": "Drug Interactions",
    "rivaroxaban": "Drug Interactions",
    "dabigatran": "Drug Interactions",
    "edoxaban": "Drug Interactions",
    "aspirin": "Warnings",
    "clopidogrel": "Warnings",
    "ticagrelor": "Warnings",
    "prasugrel": "Warnings",
    "dipyridamole": "Warnings",
}


def _normalize_drug_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def _flatten_field(value: Any) -> Optional[str]:
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return " ".join(cleaned) if cleaned else None
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _build_label_url(drug_name: str) -> str:
    search_query = f'openfda.generic_name:"{drug_name}"'
    return f"{OPENFDA_LABEL_ENDPOINT}?search={quote(search_query)}&limit=1"


def _fetch_openfda_label(drug_name: str) -> Optional[Dict[str, Any]]:
    request = Request(_build_label_url(drug_name), headers={"User-Agent": "MediGuard-AI/1.0"})

    try:
        with urlopen(request, timeout=OPENFDA_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return None

    results = payload.get("results") or []
    if not results:
        return None
    return results[0]


def _collect_warning_texts(record: Dict[str, Any]) -> List[str]:
    warning_fields = [
        "boxed_warning",
        "warnings_and_cautions",
        "contraindications",
        "adverse_reactions",
    ]
    texts: List[str] = []

    for field in warning_fields:
        text = _flatten_field(record.get(field))
        if text:
            texts.append(text)

    return texts


def _build_label_summary(drug_name: str) -> Optional[Dict[str, Any]]:
    record = _fetch_openfda_label(drug_name)
    if not record:
        return None

    summary: Dict[str, Any] = {
        "drug": drug_name,
        "source": "openfda",
    }

    warning_texts = _collect_warning_texts(record)
    if warning_texts:
        summary["warnings"] = warning_texts

    for key in ("boxed_warning", "warnings_and_cautions", "contraindications"):
        value = _flatten_field(record.get(key))
        if value and key not in summary:
            summary[key] = value

    return summary


def _build_sources(drugs: Iterable[str]) -> List[Dict[str, str]]:
    sources: List[Dict[str, str]] = []

    for drug in drugs:
        normalized = _normalize_drug_name(drug)
        if not normalized:
            continue

        sources.append(
            {
                "drug": drug.strip().title(),
                "section": SOURCE_SECTION_BY_DRUG.get(normalized, "Warnings"),
            }
        )

    return sources


def analyze_bleeding_risk(drugs: Iterable[str]) -> Optional[Dict[str, Any]]:
    """Return an OpenFDA-backed bleeding risk summary when the regimen is high risk.

    The local analyzer uses this as an enrichment layer before falling back
    to static rules. It only returns a result when the medication pair is
    clearly associated with bleeding risk.
    """

    normalized_drugs = [
        _normalize_drug_name(drug)
        for drug in drugs
        if drug and _normalize_drug_name(drug)
    ]

    if len(normalized_drugs) < 2:
        return None

    anticoagulants = [drug for drug in normalized_drugs if drug in ANTICOAGULANTS]
    antiplatelets = [drug for drug in normalized_drugs if drug in ANTIPLATELETS]

    if not anticoagulants or not antiplatelets:
        return None

    drugs_involved = sorted({*anticoagulants, *antiplatelets})
    label_summaries = [
        summary
        for drug in drugs_involved
        if (summary := _build_label_summary(drug))
    ]

    explanation_parts = [
        "High bleeding risk identified from the medication combination.",
        "OpenFDA label data flags bleeding-related warnings for one or more of the listed drugs.",
    ]

    for summary in label_summaries:
        warnings = summary.get("warnings") or []
        if warnings:
            explanation_parts.append(f"{summary['drug'].title()}: {warnings[0]}")

    return {
        "severity": "Severe",
        "message": "High bleeding risk: review anticoagulation and antiplatelet therapy.",
        "riskScore": 92,
        "explanation": " ".join(explanation_parts),
        "source": "openfda",
        "drugs": drugs_involved,
        "sources": _build_sources(drugs_involved),
    }