import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { CampaignGovernor, PedroToken, TimelockController } from '../typechain'
import hre, { ethers } from 'hardhat'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { expect } from 'chai'

enum VoteType {
  Against = 0,
  For = 1,
  Abstain = 2,
}

describe('Campaign Governor', () => {
  let signers: SignerWithAddress[]
  let pedroToken: PedroToken
  let timeLock: TimelockController
  let governor: CampaignGovernor

  before(async () => {
    signers = await ethers.getSigners()
  })

  beforeEach(async () => {
    // Deploy the token
    const pedroTokenContractFactory = await ethers.getContractFactory('PedroToken')
    pedroToken = await pedroTokenContractFactory.deploy(120)

    // Distribute the tokens to a few wallets.
    await pedroToken.deployed()
    await pedroToken.transfer(signers[1].address, 33)

    // Tokens must be delegated to someone before being used for voting, which means if the signer wants to vote,
    // he needs to delegate the tokens to himself
    await pedroToken.connect(signers[1]).delegate(signers[1].address)

    await pedroToken.transfer(signers[2].address, 33)
    await pedroToken.connect(signers[2]).delegate(signers[2].address)

    // Deploy the timelock contract
    const timeLockContractFactory = await ethers.getContractFactory('TimelockController')
    console.log('Main Wallet Address', signers[0].address)

    const minDelayBlocks = 21
    timeLock = await timeLockContractFactory.deploy(minDelayBlocks, [], [])

    await timeLock.deployed()

    const governorContractFactory = await ethers.getContractFactory('CampaignGovernor')
    governor = await governorContractFactory.deploy(pedroToken.address, timeLock.address)
    await governor.deployed()

    console.log('governor.address:', governor.address)
    console.log('timelock.address', timeLock.address)

    // Give governor's timelock some Pedro Tokens, since that contract will be
    // the one moving funds to the destination
    await pedroToken.transfer(timeLock.address, 20)

    // Allow the governor contract to propose and execute tasks
    const proposerRoleKeccak = keccak256(toUtf8Bytes('PROPOSER_ROLE'))
    await timeLock.grantRole(proposerRoleKeccak, governor.address)

    const executorRoleKeccak = keccak256(toUtf8Bytes('EXECUTOR_ROLE'))
    await timeLock.grantRole(executorRoleKeccak, governor.address)

    // TODO: Implement deployer renouncing the Admin Role
  })

  it('should support the entire proposal and execution workflow', async () => {
    // Arrange
    const recipientAddress = signers[3].address
    const proposalDescription = 'Proposal #1: Grant some money'

    // Setup proposal
    const transferCallData = pedroToken.interface.encodeFunctionData('transfer', [recipientAddress, 20])
    await governor['propose(address[],uint256[],bytes[],string)'](
      [pedroToken.address],
      [0],
      [transferCallData],
      proposalDescription,
    )

    const descriptionHash = ethers.utils.id(proposalDescription)

    const encodedArgs = ethers.utils.defaultAbiCoder.encode('address[],uint256[],bytes[],bytes32'.split(','), [
      [pedroToken.address],
      [0],
      [transferCallData],
      descriptionHash,
    ])
    const encodedKeccak = keccak256(encodedArgs)

    // Mine 23 blocks to simulate the voting delay passing
    await hre.network.provider.send('hardhat_mine', ['0x17'])

    // Cast votes
    await governor.castVote(encodedKeccak, VoteType.For) // 33%
    await governor.connect(signers[1]).castVote(encodedKeccak, VoteType.For) // 33%

    // Advance block number in 1 week to end the voting
    await hre.network.provider.send('hardhat_mine', ['0xB3CB'])

    // Queue and Execute
    await governor['queue(address[],uint256[],bytes[],bytes32)'](
      [pedroToken.address],
      [0],
      [transferCallData],
      descriptionHash,
    )

    // Mine 23 blocks to clear the TimeLock
    await hre.network.provider.send('hardhat_mine', ['0x17'])

    // Execute the proposal
    await governor['execute(address[],uint256[],bytes[],bytes32)'](
      [pedroToken.address],
      [0],
      [transferCallData],
      descriptionHash,
    )

    const recipientBalance = await pedroToken.balanceOf(recipientAddress)
    expect(recipientBalance).to.equal('20')
  })

  // TODO: Test voting delay
  // TODO: Test protection against double-spending
  // TODO: Test third party delegation
  // TODO: Test majority not reached
  // TODO: Test attempt to enqueue proposal while vote hasn't passed
  // TODO: Test quorum
})
