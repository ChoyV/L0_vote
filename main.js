const ethers = require("ethers");
const logToFile = require("./log");

const data = ["0x4b9f5c980000000000000000000000000000000000000000000000000000000000000001","0x4b9f5c980000000000000000000000000000000000000000000000000000000000000000"]
async function vote(contract_type,walletToSend,providerToSend) {
    const amounEther = "0.00021";
    const randomVote = Math.round(Math.random());
    const dataToVote = data[randomVote];
    const feeData = await providerToSend.getFeeData();
    const gasPrice1 = feeData.gasPrice;
    const connectedWallet = walletToSend.connect(providerToSend);
    let raw_tx = {
        to: contract_type,
        value:ethers.parseUnits(amounEther, "ether"),
        gasLimit:812234,
        gasPrice: gasPrice1,
        data:dataToVote,
    }

    try {
        const txResponse = await connectedWallet.sendTransaction(raw_tx);
        console.log(`Успешно!\nWallet: ${walletToSend.address}\nVoted: ${randomVote ? "Yes" : "No"}`)
        logToFile(`Успешно!\nWallet: ${walletToSend.address}\nVoted: ${randomVote ? "Yes" : "No"}`)
        console.log(txResponse.hash)

    } catch (err) {
        console.log("Error!", err)
    }
}
module.exports = vote;
