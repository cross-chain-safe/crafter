import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

const RPC_URL='https://eth-goerli.public.blastapi.io'
const safeAddress = '0xB211A5aE41227A87830195405C4Dcd74D27D5e96'

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    const owner1Signer = new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!, provider)  

    const safeAmount = ethers.utils.parseUnits('0.01', 'ether').toHexString()
    const transactionParameters = {
        to: safeAddress,
        value: safeAmount
    }

    const tx = await owner1Signer.sendTransaction(transactionParameters)

    console.log('Fundraising.')
    console.log(`Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`)
}

main();