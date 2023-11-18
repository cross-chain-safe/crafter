import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import mailboxRegistry from "./hyperlane/mailboxRegistry";
import {SafeTransactionDataPartial} from "@safe-global/safe-core-sdk-types";
import recipientRegistry from "./hyperlane/recipientRegistry";

export type HyperlaneDispatchParams = {
    sourceChainId: number,
    destinationChainId: number,
    intentActions: SafeProtocolAction[]
    value: string,
}

export type SafeProtocolAction = {
    to: string,
    value: string,
    data: string
}

export type SafeTransaction = {
    actions: SafeProtocolAction[],
    nonce: string,
    metadataHash: string,
}

const ABI_CODER = new ethers.utils.AbiCoder();

const craftSafeDispatchTx = async (safe: Safe, {
    sourceChainId,
    destinationChainId,
    intentActions,
    value
}: HyperlaneDispatchParams) => {
    const mailboxAddress = mailboxRegistry[sourceChainId];
    const recipientHandlerAddress = recipientRegistry[destinationChainId];

    if (!mailboxAddress) {
        throw new Error(`No mailbox address found for chainId ${sourceChainId}`);
    }

    if (!recipientHandlerAddress) {
        throw new Error(`No recipient handler address found for chainId ${destinationChainId}`);
    }

    // 1. Safe Plugin (Safe Transaction Struct) for "executeFromPlugin" function
    // Original intent call data on destination chain
    const destinationSafeTx: SafeTransaction = {
        actions: intentActions,
        nonce: '0x',
        metadataHash: ethers.constants.HashZero,
    }
    const destinationSafeEncodedData = encodeSafeTransaction(destinationSafeTx);
    // endregion

    // 2. Hyperlane "dispatch" transaction on source chain
    const destinationChainCallData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(destinationSafeEncodedData));
    const dispatchCallData = encodeHyperlaneDispatchTransaction(destinationChainId, recipientHandlerAddress, destinationChainCallData)
    // endregion

    // 3. Safe Transaction on source chain
    const safeHyperlaneDispatchTx: SafeTransactionDataPartial = {
        to: mailboxAddress,
        data: dispatchCallData,
        value,
    }
    return safe.createTransaction({ safeTransactionData: safeHyperlaneDispatchTx })
}

const encodeSafeTransaction = (safeTransaction: SafeTransaction): string  => {
    return ABI_CODER.encode(
        [
            'tuple(address to, uint256 value, bytes data)[]',
            'uint256',
            'bytes32'
        ],
        [
            safeTransaction.actions,
            safeTransaction.nonce,
            safeTransaction.metadataHash
        ]
    );
}

const encodeHyperlaneDispatchTransaction = (destinationChainId: number, destinationAddress: string, destinationChainCallData: string): string => {
    const destinationAddressBytes32 = ethers.utils.formatBytes32String(destinationAddress);
    return ABI_CODER.encode(
        [
            'uint32',
            'bytes32',
            'bytes'
        ],
        [destinationChainId, destinationAddressBytes32, destinationChainCallData]
    );
}

export {
    craftSafeDispatchTx,
}