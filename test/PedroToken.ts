import chai from 'chai'
import { ethers } from 'hardhat'
import { PedroToken } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const { expect } = chai

describe('PedroToken', function () {
  let signers: SignerWithAddress[]
  let pedroToken: PedroToken

  before(async () => {
    signers = await ethers.getSigners()
  })

  beforeEach(async () => {
    const pedroTokenContractFactory = await ethers.getContractFactory('PedroToken')
    pedroToken = await pedroTokenContractFactory.deploy(100)
    // BigNumber.from(ethers.utils.parseEther('1'))
    await pedroToken.deployed()
  })

  it('should mint initial supply to token deployer', async function () {
    expect(await pedroToken.totalSupply()).to.equal(100)
    expect(await pedroToken.balanceOf(signers[0].address)).to.equal(100)
  })

  it('should transfer supply from one address to another', async () => {
    // Act
    await pedroToken.transfer(signers[1].address, 51, {
      from: signers[0].address,
    })

    // Assert
    expect(await pedroToken.balanceOf(signers[0].address)).to.equal(49)
    expect(await pedroToken.balanceOf(signers[1].address)).to.equal(51)
    expect(await pedroToken.totalSupply()).to.equal(100)
  })

  it('should allow owner to mint more', async () => {
    // Act
    await pedroToken.mintMore(200, {
      from: signers[0].address,
    })

    // Assert
    expect(await pedroToken.balanceOf(signers[0].address)).to.equal(300)
    expect(await pedroToken.totalSupply()).to.equal(300)
  })

  it('should reject mint requests from other users', async () => {
    // Act
    const promise = pedroToken.connect(signers[1]).mintMore(200)

    // Assert
    await expect(promise).to.eventually.be.rejectedWith(/Only deployer wallet can perform this action/)
    expect(await pedroToken.totalSupply()).to.equal(100)
  })
})
