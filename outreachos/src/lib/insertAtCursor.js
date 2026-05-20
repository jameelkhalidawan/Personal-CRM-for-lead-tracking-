/** Insert text at the current selection in an input/textarea; restores focus and caret. */
export function insertAtCursor(element, currentValue, insertText) {
  const start = element?.selectionStart ?? currentValue.length;
  const end = element?.selectionEnd ?? currentValue.length;
  const next = currentValue.slice(0, start) + insertText + currentValue.slice(end);
  const caret = start + insertText.length;

  if (element) {
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(caret, caret);
    });
  }

  return next;
}
