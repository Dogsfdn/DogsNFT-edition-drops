'use client';

import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { arbitrum } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = defineChain( arbitrum );

  const [quantity, setQuantity] = useState(1);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xaDf72289edC9b3a3724377Fe9b095248fd6E451E"
  });

  const { data: contractMetadata, isLoading: isContractMetadataLaoding } = useReadContract( getContractMetadata,
    { contract: contract }
  );

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } = useReadContract( getTotalClaimedSupply,
    { contract: contract}
  );

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
    { contract: contract }
  );

  const { data: claimCondition } = useReadContract( getActiveClaimCondition,
    { contract: contract }
  );

  const getPrice = (quantity: number) => {
    const total = quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
	    <div className="py-20 text-center">
        <Header />
        <ConnectButton
          client={client}
          chain={chain}
        />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLaoding ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">
                {contractMetadata?.description}
              </p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Claimed: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          <TransactionButton
            transaction={() => claimTo({
              contract: contract,
              to: account?.address || "",
              quantity: BigInt(quantity),
            })}
            onTransactionConfirmed={async () => {
              alert("Successfully Minted 1 Dog!");
              setQuantity(1);
            }}
          >
            {`Mint Dogs (${getPrice(quantity)} ETH)`}
          </TransactionButton>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-row items-center">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        
      </h1>
    </header>
  );
}