import type { AIFlag } from "./types";

export const mockFlags: AIFlag[] = [
  {
    id: "flag-01",
    returnId: "return-01",
    fieldId: "field-01-mortgage",
    message: "Mortgage interest is 40% higher than last year",
    reasoning:
      "This client's 2024 Form 1098 reported $13,400 in mortgage interest. The 2025 amount of $18,720 is a 39.7% increase. No refinance or home equity loan documents were uploaded. This could be a data extraction error or an undocumented loan change that needs client confirmation.",
    confidence: 82,
    evidenceDocIds: ["doc-01c", "doc-07b"],
    suggestedAction:
      "Request refinance or HELOC documentation from the client, or verify the Form 1098 Box 1 amount against the original PDF.",
    status: "pending",
  },
  {
    id: "flag-02",
    returnId: "return-01",
    fieldId: "field-01-charity",
    message: "Charitable contributions lack supporting documentation",
    reasoning:
      "An $8,500 charitable contribution was entered, but no donation receipts or acknowledgment letters were found in the uploaded documents. IRS requires contemporaneous written acknowledgment for gifts of $250 or more. Without substantiation, this deduction is at audit risk.",
    confidence: 91,
    evidenceDocIds: [],
    suggestedAction:
      "Request donation receipts from the client, or reduce the deduction to amounts that can be substantiated.",
    status: "pending",
  },
  {
    id: "flag-03",
    returnId: "return-02",
    fieldId: "field-02-meals",
    message: "Meals expense may include nondeductible entertainment",
    reasoning:
      "The expense ledger categorizes $13,680 under 'Client Meals & Events.' Of that, $4,200 is labeled 'Skybox tickets — season opener' and $1,800 as 'Golf outing sponsorship.' Entertainment expenses are generally nondeductible after TCJA. Only the meals portion (likely ~$7,680) should be subject to the 50% limitation.",
    confidence: 76,
    evidenceDocIds: ["doc-02c"],
    suggestedAction:
      "Reclassify entertainment costs as nondeductible and recalculate the 50% meals deduction on the remaining $7,680 ($3,840 deductible).",
    status: "pending",
  },
  {
    id: "flag-04",
    returnId: "return-06",
    fieldId: "field-06-depreciation",
    message: "Depreciation jumped 55% with no corresponding asset additions",
    reasoning:
      "Prior-year depreciation was $120,800. The current schedule shows $187,400 — a $66,600 increase — but the fixed asset register only lists $12,400 in new acquisitions. Bonus depreciation or a change in useful life may have been applied without documentation. This variance often triggers IRS matching notices.",
    confidence: 84,
    evidenceDocIds: ["doc-06b", "doc-06a"],
    suggestedAction:
      "Confirm whether Section 168(k) bonus depreciation was elected, and obtain the updated fixed asset rollforward from the client.",
    status: "pending",
  },
];
