/** Whether auto-generated template notes may replace the current notes field */
export function shouldReplaceTemplateNotes(currentNotes, lastAutoFilledNotes) {
  const current = String(currentNotes ?? '').trim();
  const last = String(lastAutoFilledNotes ?? '').trim();
  if (!current) return true;
  if (last && current === last) return true;
  return false;
}
