export default function Home() {
  return (
    <main className="flex min-h-[80dvh] flex-col items-center justify-center p-8" style={{ minHeight: '80dvh', padding: 'var(--space-8)' }}>
      <div className="text-center max-w-md" style={{ maxWidth: '28rem' }}>
        <h1 className="text-display font-bold text-5xl mb-4 text-[var(--color-text-primary)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
          }}>
          Hive Academy
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8"
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-8)',
          }}>
          Training & Habit Management System
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/community"
            className="btn btn-primary btn-lg"
            style={{
              minHeight: 'var(--touch-target-comfortable)',
              padding: 'var(--space-3) var(--space-6)',
            }}
          >
            Vào cộng đồng
          </a>
          <a
            href="/learn"
            className="btn btn-secondary btn-lg"
            style={{
              minHeight: 'var(--touch-target-comfortable)',
              padding: 'var(--space-3) var(--space-6)',
            }}
          >
            Khóa học
          </a>
        </div>
      </div>
    </main>
  );
}