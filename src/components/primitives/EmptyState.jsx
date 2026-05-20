import { Inbox } from 'lucide-react'
import Panel from './Panel'

export default function EmptyState({
  title = 'No matching data',
  description = 'Try adjusting or clearing the current filters.',
  action = null,
}) {
  return (
    <Panel className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5e5e5] bg-[#fafafa] text-[#767676]">
        <Inbox size={22} />
      </div>
      <h3 className="font-display mt-4 text-xl font-semibold text-[#000000]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#4a4a4a]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Panel>
  )
}
