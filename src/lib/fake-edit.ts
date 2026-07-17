/** Produce a plausible corrected currency/value for the "Edit manually" prototype flow. */
export function fakeEditedValue(value: string): string {
  const currencyMatch = value.match(/^\$([\d,]+)(\.\d{2})?$/);
  if (currencyMatch) {
    const whole = Number(currencyMatch[1].replace(/,/g, ""));
    const cents = currencyMatch[2] ? Number(currencyMatch[2]) : 0;
    const amount = whole + cents;
    // Nudge ~12% down so the edit is visibly different from the AI value
    const edited = Math.round(amount * 0.88 * 100) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(edited);
  }

  return `${value} (corrected)`;
}
