import { COMPACT_QUERY } from './common/layout.ts'
import { Header } from './common/Header.tsx'
import { useMediaQuery } from './common/useMediaQuery.ts'
import type { GrammarPage as Page } from './grammar.ts'

// A grammar page on its own (from the home page): header with a back arrow, then the content
export function GrammarPage({ page, onBack }: { page: Page; onBack: () => void }) {
  const compact = useMediaQuery(COMPACT_QUERY);
  const { Content } = page;
  return (
    <div className={compact ? 'app compact' : 'app'}>
      <Header title={page.title} iconSize={compact ? 24 : 22} onBack={onBack} backLabel="Back" />
      <main>
        <section className="card grammar">
          <Content compact={compact} />
        </section>
      </main>
    </div>
  );
}
