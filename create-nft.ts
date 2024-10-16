import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey
} from "@metaplex-foundation/umi";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);
console.log("Loaded user account", user.publicKey.toBase58());

const umi = await createUmi(connection.rpcEndpoint);

umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("setup umi instance with user identity");

const collectionAddress = publicKey("9GupUcp6qhhj9cQg2fFWqortJ3bJj6eyvgTtqvjheuBz")

console.log("Creating NFT...");
const mint = generateSigner(umi);

const transaction = await createNft(umi,{
    mint,
    name: "My NFT",
    symbol: "NFT",
    uri:"http://.....",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: false,
    collection:{
        key: collectionAddress,
        verified:false
    }
})

await transaction.sendAndConfirm(umi);

const createdNFT = await fetchDigitalAsset(umi, mint.publicKey);
console.log("NFT created", getExplorerLink("address",createdNFT.mint.publicKey,"devnet"),);