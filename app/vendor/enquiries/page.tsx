import { ConversationInbox } from '@/components/chat/ConversationInbox'
import { VendorShell } from '@/components/vendor/VendorShell'

export default function VendorEnquiriesPage() {
  return (
    <VendorShell>
      <div className="mx-auto w-full max-w-[640px] pb-10">
        <div className="px-4 pb-4 pt-5">
          <h1 className="font-syne text-[20px] font-bold text-foreground">Enquiries</h1>
        </div>
        <ConversationInbox />
      </div>
    </VendorShell>
  )
}