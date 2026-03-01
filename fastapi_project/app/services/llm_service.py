



# def get_LLM_data(redacted_text: str):
#     print(f"Inside LLM Function, using {redacted_text}")

#     mock_data = {
#         "resource": "Vibranium",
#         # "quantity": "low",
#         "quantity": 0.00,
#         "urgency": "high",
#         "location": "Wakanda"
#     }

#     return mock_data

import json
import os
from typing import Any, Dict

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EXTRACTION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "resource": {
            "type": ["string", "null"],
            "description": "Name of the resource/material mentioned (e.g., Vibranium, Arc Reactor Cores, Pym Particles, Clean Water, Medical Kits).",
        },
        "quantity": {
            "type": ["integer", "null"],
            "enum": [0, 1, 2, 3, 4, None],
            "description": "Coarse level: 0=none, 1=critical, 2=low, 3=medium, 4=high.",
        },
        "urgency": {
            "type": ["string", "null"],
            "enum": ["critical", "low", "medium", "high", None],
        },
        "location": {
            "type": ["string", "null"],
            "description": "Location/site mentioned (e.g., New Asgard, Wakanda, Sokovia, Sanctum Sanctorum, Avengers Compound).",
        },
    },
    "required": ["resource", "quantity", "urgency", "location"],
}

def get_LLM_data(redacted_text: str) -> Dict[str, Any]:

    system_instructions = (
        "You are an information extraction engine. "
        "Extract the requested fields from the input text. "
        "Return ONLY valid JSON that matches the provided schema. "
        "If a field is not present, use null. "
        "If the text indicates something is 'out of' a resource, quantity should be 0 and quantity_status should be 'none'. "
        "Do not invent details."
    )

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": redacted_text},
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "report_extraction",
                    "schema": EXTRACTION_SCHEMA,
                    "strict": True,
                }
            },
        )

        data = json.loads(response.output_text)
        return data

    except Exception as e:
        print("LLM extraction error:", e)
        return {
            "resource": None,
            "quantity": None,
            "urgency": None,
            "location": None,
        }



# # Optional test run
# if __name__ == "__main__":
#     result = get_LLM_data(
#         "Just a heads up, Sokovia is out of Vibranium (kg). "
#         "This is [REDACTED], call me back at [REDACTED]."
#     )
#     print(result)