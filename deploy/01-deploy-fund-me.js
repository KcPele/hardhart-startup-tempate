//import

const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// function deployFunc(hre) {
//     console.log("test")

// }

// module.exports.default = deployFunc

// async nameless function
module.exports = async ({ getNamedAccounts, deployments }) => {
    // const  { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUSdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUSdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUSdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUSdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //using mock for localhost testing or if the contract does not exist
    const args = [ethUSdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //pust what contructor acceps
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, args)
    }
    log("----------------------------")
}
module.exports.tags = ["all", "fundMe"]
