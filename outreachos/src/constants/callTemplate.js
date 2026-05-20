import { newScriptId } from '../lib/callTemplateApi';

export { SUGGESTED_CATEGORIES, TEMPLATE_PLACEHOLDERS } from './emailTemplate';

export function createEmptyCallTemplateForm() {
  return {
    name: '',
    category: '',
    scripts: [{ id: newScriptId(), label: 'Opening', body: '' }],
  };
}
