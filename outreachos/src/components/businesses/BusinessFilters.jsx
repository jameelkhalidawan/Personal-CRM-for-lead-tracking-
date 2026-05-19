import { BUSINESS_PRIORITIES, BUSINESS_SORT_OPTIONS, BUSINESS_STATUSES } from '../../constants/business';
import { useBusinessStore } from '../../stores/businessStore';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Input';
import { cn } from '../../lib/cn';

export function BusinessFilters({ search, onSearchChange }) {
  const {
    services,
    filterStatus,
    filterPriority,
    filterServiceIds,
    sortBy,
    setFilterStatus,
    setFilterPriority,
    setSortBy,
    toggleServiceFilter,
  } = useBusinessStore();

  return (
    <div className="space-y-4 mb-6">
      <SearchInput
        placeholder="Search name, niche, or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Select
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-w-[160px]"
        >
          <option value="">All statuses</option>
          {BUSINESS_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select
          label="Priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="min-w-[140px]"
        >
          <option value="">All priorities</option>
          {BUSINESS_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="min-w-[180px]"
        >
          {BUSINESS_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      {services.length > 0 && (
        <div>
          <p className="text-label uppercase text-text-muted mb-2">Services</p>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const active = filterServiceIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleServiceFilter(s.id)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-small transition-colors',
                    active
                      ? 'border-accent-primary bg-accent-primary/15 text-text-primary'
                      : 'border-border text-text-secondary hover:border-border-hover',
                  )}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
