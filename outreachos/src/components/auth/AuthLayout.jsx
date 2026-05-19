export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-label uppercase text-text-muted tracking-widest mb-2">
            OutreachOS
          </p>
          <h1 className="text-h1 text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-text-secondary mt-2 text-body">{subtitle}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-background-card p-8 shadow-lg">
          {children}
        </div>
        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  );
}
