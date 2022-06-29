import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import { useState } from "react";
import NFTTile from "./NFTTile";
import { Network, initializeAlchemy, getNftsForCollection } from '@alch/alchemy-sdk';


export default function Profile() {
    // Using HTTPS

    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const settings = {
        apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,  // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI,  // Replace with your network.
        maxRetries: 10
      };
    
    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        let sumPrice = 0;
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        console.log("Signer address :", addr);

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        const alchemy = initializeAlchemy(settings);
        // Print total NFT count returned in the response:
        const nftsForCollection = await getNftsForCollection(
            alchemy,
            MarketplaceJSON.address
        );

        let itemvalue = [];
        await Promise.all(nftsForCollection.nfts.map(async i => {
        
            //Alchemy API to get ListedToken details
            let transaction = await contract.getListedTokenForId(i.tokenId);
            if(addr === transaction.seller) {
                let price = i.rawMetadata.price;
                let item = {
                    tokenId: i.tokenId,
                    owner: MarketplaceJSON.address,
                    image: i.rawMetadata.image,
                    name: i.rawMetadata.name,
                    description: i.description,
                }
                sumPrice += Number(price);
                itemvalue.push(item);
            }

        }))

        updateData(itemvalue);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched)
        getNFTData(tokenId);

    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                        })}
                    </div>
                    <div className="mt-10 text-xl">
                        {data.length === 0 ? "Oops, No NFT data to display (Are you logged in?)" : ""}
                    </div>
                </div>
            </div>
        </div>
    )
};