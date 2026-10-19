/**
 * Exibido no primeiro carregamento enquanto o código de uma página sob demanda (lazy)
 * é baixado. O cabeçalho e o rodapé já aparecem; só a área de conteúdo espera.
 */
export function RouteFallback() {
  return (
    <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <span
        aria-hidden="true"
        className="size-10 rounded-full border-4 border-teal-100 border-t-primary motion-safe:animate-spin"
      />
      <span className="font-semibold text-ink-muted">Carregando a página…</span>
    </div>
  )
}
