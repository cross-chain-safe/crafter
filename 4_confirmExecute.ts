import { ethers } from 'ethers'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import dotenv from 'dotenv'
import SafeApiKit from '@safe-global/api-kit'
import { SafeFactory } from '@safe-global/protocol-kit'
import { SafeAccountConfig } from '@safe-global/protocol-kit'


dotenv.config()
const safeAddress = '0xB211A5aE41227A87830195405C4Dcd74D27D5e96'
// https://chainlist.org/?search=goerli&testnets=true
const RPC_URL='https://eth-goerli.public.blastapi.io'

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

    // Initialize signers
    const owner1Signer = new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!, provider)
    const owner2Signer = new ethers.Wallet(process.env.OWNER_2_PRIVATE_KEY!, provider)

    const ethAdapterOwner1 = new EthersAdapter({
        ethers,
        signerOrProvider: owner1Signer
    })

    const ethAdapterOwner2 = new EthersAdapter({
        ethers,
        signerOrProvider: owner2Signer
    })

    const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
    const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapterOwner2 })

    const pendingTransactionsResponse = await safeService.getPendingTransactions(safeAddress);

    const pendingTransactions = pendingTransactionsResponse.results

    // Assumes that the first pending transaction is the transaction you want to confirm
    const transaction = pendingTransactions[0]
    const safeTxHash = transaction.safeTxHash

    const safeSdkOwner1 = await Safe.create({
        ethAdapter: ethAdapterOwner1,
        safeAddress
    })

    const safeSdkOwner2 = await Safe.create({
        ethAdapter: ethAdapterOwner2,
        safeAddress
    })

    const signature = await safeSdkOwner2.signTransactionHash(safeTxHash)
    const response = await safeService.confirmTransaction(safeTxHash, signature.data)
    console.log(`confirm transaction response ${JSON.stringify(response)}`)

    const executeTxResponse = await safeSdkOwner1.executeTransaction(transaction)
    const receipt = await executeTxResponse.transactionResponse?.wait()

    if(!receipt) {
        throw new Error('Transaction failed')
    }

    console.log('Transaction executed:')
    console.log(`https://goerli.etherscan.io/tx/${receipt.transactionHash}`)
}

main();