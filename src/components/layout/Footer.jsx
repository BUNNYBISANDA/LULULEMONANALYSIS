import { useDashboardDataset } from '../../hooks/useDataset'

export default function Footer() {
  const { data } = useDashboardDataset(true)

  return (
    <footer className="border-t border-[#e5e5e5] bg-white">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-3 py-6 text-sm text-[#4a4a4a] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8">
        <p>
          Data updated May 2026 | {data?.masterReviews.length ?? 0} low-star reviews |{' '}
          {data?.imageItems.length ?? 0} customer images
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/BUNNYBISANDA/lululemon"
            target="_blank"
            rel="noreferrer"
            className="text-[#767676] transition hover:text-[#000000]"
          >
            Source Repository
          </a>
          <span className="hidden h-3 w-px bg-black/10 sm:block" />
          <p>
            Client-facing analysis for{' '}
            {data?.isAllProducts
              ? 'multi-product lululemon review intelligence.'
              : `${data?.selectedProductName || 'lululemon'} review intelligence.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
