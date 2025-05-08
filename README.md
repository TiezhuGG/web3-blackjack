## This project is a simple web3 Black Jack game built with Solidity, Hardhat, and React.

You should start running the Hardhat node and deploy the contract:
```shell
cd smart-contracts
pnpm install
npx hardhat compile
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/BlackJack.ts --network localhost
```

Then, you should start the React app:
```shell
pnpm install
pnpm dev
```

create .env in your root directory add your environment variables.
```shell
SHADOW_DATABASE_URL=
DATABASE_URL=
JWT_SECRET=
```