import { ethers } from 'ethers'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import dotenv from 'dotenv'
import SafeApiKit from '@safe-global/api-kit'
import { SafeFactory } from '@safe-global/protocol-kit'
import { SafeAccountConfig } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'


dotenv.config()

// https://chainlist.org/?search=goerli&testnets=true
const RPC_URL='https://eth-goerli.public.blastapi.io'
const safeAddress = '0xB211A5aE41227A87830195405C4Dcd74D27D5e96'

export async function getTransaction () {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

    // // Initialize signers
    const owner1Signer = new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!, provider)
    
    const ethAdapterOwner1 = new EthersAdapter({
        ethers,
        signerOrProvider: owner1Signer
    })

    const safeSdkOwner1 = await Safe.create({ ethAdapter: ethAdapterOwner1, safeAddress })    

    // Any address can be used. In this example you will use vitalik.eth
    const destination = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    const amount = ethers.utils.parseUnits('0.005', 'ether').toString()

    const safeTransactionData: SafeTransactionDataPartial = {
        to: destination,
        data: '0x',
        value: amount
    }
    // Create a Safe transaction with the provided parameters
    return await safeSdkOwner1.createTransaction({ safeTransactionData })
}