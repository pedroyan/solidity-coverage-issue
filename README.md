# solidity-coverage repro

This repository demonstrates the solidity coverage problems described on [issue 652](https://github.com/sc-forks/solidity-coverage/issues/652)

## Running the repro
1. Install all dependencies with `yarn install`
2. Compile contract and types with `yarn compile`
3. Run coverage with `yarn cover`


## Expected outcome
- Code generates coverage report

## Actual outcome
- Transaction fails due to gas price being lower than the base fee
  - `Transaction gasPrice (1) is too low for the next block, which has a baseFeePerGas of 7`


## Interesting notes
If you comment out the Campaign Governor test, the problem goes away - which might indicate that the tests are raising network activity and raising fees as a result