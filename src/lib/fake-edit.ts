import type { AIFlag } from "@/lib/mock-data";

/** Demo-friendly corrected values for "Edit manually" on known flagged fields. */
const FIELD_CORRECTIONS: Record<string, string> = {
  "field-01-mortgage": "$13,400.00",
  "field-01-charity": "$0.00",
  // Suggested 50% meals deduction after removing entertainment
  "field-02-meals": "$3,840.00",
  "field-06-depreciation": "$120,800.00",
};

/** Produce a plausible corrected value for the "Edit manually" prototype flow. */
export function correctedValueForFlag(
  flag: AIFlag,
  currentValue: string
): string {
  const demo = FIELD_CORRECTIONS[flag.fieldId];
  if (demo) return demo;

  // Prefer an explicit "$X,XXX deductible" style amount from the suggestion
  const deductible = flag.suggestedAction.match(
    /\$[\d,]+(?:\.\d{2})?\s+deductible/i
  );
  if (deductible) {
    const amount = deductible[0].match(/\$[\d,]+(?:\.\d{2})?/);
    if (amount) {
      return amount[0].includes(".") ? amount[0] : `${amount[0]}.00`;
    }
  }

  return fakeEditedValue(currentValue);
}

function fakeEditedValue(value: string): string {
  const currencyMatch = value.match(/^\$([\d,]+)(\.\d{2})?$/);
  if (currencyMatch) {
    const whole = Number(currencyMatch[1].replace(/,/g, ""));
    const cents = currencyMatch[2] ? Number(currencyMatch[2]) : 0;
    const amount = whole + cents;
    const edited = Math.round(amount * 0.88 * 100) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(edited);
  }

  return `${value} (corrected)`;
}
