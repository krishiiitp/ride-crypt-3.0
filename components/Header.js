"use client"
import React , {useState} from "react";
import Image from "next/image";
import { UserButton} from "@clerk/nextjs";
import Web3 from "web3";
import Web3Modal from "web3modal";
let web3modal=null;
if(typeof window!=='undefined'){
    web3modal=new Web3Modal({
        network : "mainnet",
        cacheProvider:true
    })
}
export default function Header() {
    const [address,setAddress]=useState(null);
    const connectWallet=async()=>{
        const provider=await web3modal.connect();
        const web3=new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            setAddress(accounts[0]);
        }
    }
    const headerMenu=[
        {
            id : 1,
            name : "Ride",
            icon : "/taxi.png"
        }
    ]
    return (
        <div className="p-5 pb-3 pl-10 border-b-[4px] border-gray-200 flex items-center justify-between">
            <div className="flex gap-24 items-center">
                <Image
                src="/logo.png"
                width={100}
                height={100} 
                />
                <div className="flex gap-6 items-center">
                    {headerMenu.map((item)=>(
                        <div className="flex gap-2 items-center">
                            <Image 
                            src={item.icon}
                            width={17}
                            height={17}
                            />
                            <h2 className="text-[14px] font-medium">{item.name}</h2>
                        </div>
                    ))}
                </div>
                {address ? 
                <div>
                    <h1>{address}</h1>
                </div> 
                : 
                <button className="flex gap-x-3 justify-center text-center items-center mx-auto px-2 py-2 text-white rounded-lg bg-slate-600" onClick={connectWallet}>
                <h1>Connect Metamask</h1>
                <Image src="/metamask.png" width={40} height={40} />
                </button>}
            </div>
            <div className="flex gap-x-6">
                <div className="justify-center text-center items-center mx-auto"><UserButton /></div>
            </div>
        </div>
    )
}