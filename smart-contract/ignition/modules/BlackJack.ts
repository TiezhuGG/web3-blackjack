import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlackJackModule = buildModule("BlackJackModule", (m) => {
  const blackJack = m.contract("BlackJack");

  return { blackJack };
});

export default BlackJackModule;
