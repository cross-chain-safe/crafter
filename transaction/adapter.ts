// https://chainlist.org/?search=goerli&testnets=true
import {ethers} from "ethers";
import {EthersAdapter} from "@safe-global/protocol-kit";

const RPC_URL='https://eth-goerli.public.blastapi.io'
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

let ethAdapter: EthersAdapter;

const getEthAdapter = () => {
    if (!ethAdapter) {
        ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer
        })
    }
    return ethAdapter;
}


export { getEthAdapter };
