const ethers = require("ethers");
const fs = require("fs");
const vote = require("./main");
const logToFile = require("./log");
require("dotenv").config();



const filename = "wallets.txt";
const providers = {
    Optimism: {
        provider: new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC),
        contract: "0x27Af77A7B70DF78E4F112c413A48C9784a27EC2a",
    },
    Arbitrum: {
        provider: new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC),
        contract: "0xd5b450646037a9d98F4A6705b2D0D1Da44E629d0",
    },
    Base: {
        provider: new ethers.JsonRpcProvider(process.env.BASE_RPC),
        contract: "0x903b8a6c26afd8c20a91c988266ef93c1d52640f",
    },
    Polygon: {
        provider: new ethers.JsonRpcProvider(process.env.POLYGON_RPC),
        contract: "0x037bca7e8be0ab1e7ea145dff7e46b64214d613f",
    },
};




function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function randomDelay(min, max) {
    const delay = getRandomDelay(min, max);
    logToFile(`Задержка: ${delay} мс`);
    return new Promise((resolve) => setTimeout(resolve, delay));
}

async function checkBalance(walletpriv) {
    try {
        const wallet = new ethers.Wallet(walletpriv);
        const address = wallet.address;
        console.log(`\n🔍 Проверка кошелька: ${address}`);
        logToFile(`🔍 Проверка кошелька: ${address}`);

        for (const [network, { provider, contract }] of Object.entries(providers)) {
            try {
                const balance = await provider.getBalance(address);
                const formattedBalance = parseFloat(ethers.formatEther(balance));
                console.log(`🌐 Сеть: ${network}`);
                console.log(`💰 Баланс: ${formattedBalance.toFixed(6)} ETH`);
                logToFile(`🌐 Сеть: ${network}, 💰 Баланс: ${formattedBalance.toFixed(6)} ETH`);

                if (formattedBalance >= 0.00023) {
                    console.log(`✅ Баланс позволяет выполнить голосование!`);
                    console.log(`🔗 Адрес контракта: ${contract}`);
                    logToFile(`✅ Баланс позволяет выполнить голосование в сети ${network}. Кошелек: ${address}`);
                    await vote(contract, wallet, provider);
                    break; 
                }
            } catch (err) {
                console.error(
                    `❌ Ошибка в сети ${network} для кошелька ${address}: ${err.message}`
                );
                logToFile(`❌ Ошибка в сети ${network} для кошелька ${address}: ${err.message}`);
            }
        }
    } catch (err) {
        console.error(`❌ Ошибка для приватного ключа: ${walletpriv} - ${err.message}`);
        logToFile(`❌ Ошибка для приватного ключа: ${walletpriv} - ${err.message}`);
    }
}

async function processWallets() {
    try {
        // Читаем файл построчно
        const privateKeys = fs
            .readFileSync(filename, "utf8")
            .split("\n")
            .filter(Boolean); 

        console.log(`📋 Обнаружено ${privateKeys.length} кошельков для проверки.`);
        logToFile(`📋 Обнаружено ${privateKeys.length} кошельков для проверки.`);

        
        for (const key of privateKeys) {
            console.log(`\n🚀 Начинаем проверку следующего кошелька...`);
            logToFile(`🚀 Начинаем проверку следующего кошелька...`);
            await checkBalance(key.trim());
            await randomDelay(process.env.DELAY_MIN, process.env.DELAY_MAX);
            console.log(`⏳ Задержка завершена, продолжаем...`);
            logToFile(`⏳ Задержка завершена, продолжаем...`);
        }

        console.log(`✅ Все кошельки обработаны.`);
        logToFile(`✅ Все кошельки обработаны.`);
    } catch (err) {
        console.error(`❌ Ошибка при обработке файла: ${err.message}`);
        logToFile(`❌ Ошибка при обработке файла: ${err.message}`);
    }
}

processWallets()

