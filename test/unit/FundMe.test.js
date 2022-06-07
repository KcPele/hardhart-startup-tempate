const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")
!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          let sendValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              //to get the account from another network
              // const accounts = ethers.getSigners()
              // const account0 = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fundMe", async function () {
              it("fails if u dont send enouch eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to send more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAmountToAccountFunded(
                      deployer
                  )
                  assert(sendValue.toString(), response.toString())
              })
              it("add getFunders to fund array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunders(0)
                  assert.equal(deployer, response)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single funder", async function () {
                  //arrange
                  const startingfundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  //to get the gas price for calling withdraw
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMebalace = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMebalace, 0)
                  assert.equal(
                      startingfundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("it allows us to widthraw with multiple getFunders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectContract.fund({ value: sendValue })
                  }
                  const startingfundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  //to get the gas price for calling withdraw
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMebalace = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMebalace, 0)
                  assert.equal(
                      startingfundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAmountToAccountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only allow owner to call withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectContract = await fundMe.connect(attacker)
                  await expect(
                      attackerConnectContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("withdraw ETH from a single funder", async function () {
                  //arrange
                  const startingfundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.cheaperWidthraw()
                  const txReceipt = await txResponse.wait(1)
                  //to get the gas price for calling withdraw
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMebalace = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMebalace, 0)
                  assert.equal(
                      startingfundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("cheaperWithdraw testing...", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectContract.fund({ value: sendValue })
                  }
                  const startingfundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const txResponse = await fundMe.cheaperWidthraw()
                  const txReceipt = await txResponse.wait(1)
                  //to get the gas price for calling cheaperWidthraw
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMebalace = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMebalace, 0)
                  assert.equal(
                      startingfundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAmountToAccountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
