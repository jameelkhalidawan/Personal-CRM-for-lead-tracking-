/** Template categories for a business based on services (#5, #13) */
export function getTemplateCategoriesForBusiness(business, serviceTemplateMap = {}) {
  const categories = new Set();
  for (const service of business?.services ?? []) {
    const cats = serviceTemplateMap[service.id];
    if (Array.isArray(cats)) {
      cats.forEach((c) => {
        if (String(c).trim()) categories.add(String(c).trim());
      });
    }
  }
  if (business?.niche?.trim()) {
    categories.add(business.niche.trim());
  }
  return [...categories];
}

export function filterTemplatesByContext(templates, business, serviceTemplateMap = {}) {
  const preferred = getTemplateCategoriesForBusiness(business, serviceTemplateMap);
  if (!preferred.length) return templates;

  const matched = templates.filter(
    (t) => t.category && preferred.some((c) => c.toLowerCase() === t.category.toLowerCase()),
  );
  const rest = templates.filter((t) => !matched.includes(t));
  return [...matched, ...rest];
}
