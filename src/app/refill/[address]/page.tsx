import Refill from '@/Refill'
import { isAddress } from 'viem'

function Page({ params }: { params: { address: string } }) {
  if (!params.address) throw 'No address'
  if (!isAddress(params.address)) throw 'Invalid address'

  return (
    <main>
      <Refill address={params.address} />
    </main>
  )
}

export default Page
