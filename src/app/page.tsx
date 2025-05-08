"use client";
import { useState } from "react";
import { GameStateProp } from "./api/route";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "@/constants";
import { ethers } from "ethers";

export default function Page() {
  const [message, setMessage] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [playerHand, setPlayerHand] = useState<
    { suit: string; rank: string }[]
  >([]);
  const [dealerHand, setDealerHand] = useState<
    { suit: string; rank: string }[]
  >([]);

  const { address, isConnected } = useAccount();
  const [isSigned, setIsSigned] = useState<boolean>(false);

  const initGame = async () => {
    const response = await fetch(`/api?address=${address}`, {
      method: "GET",
    });
    const data = await response.json();

    setData(data);
  };

  const handleAction = async (action: string) => {
    const response = await fetch("/api", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ action, address }),
    });
    const data = await response.json();

    setData(data);
  };
  // test transfer
  const handleTest = async () => {
    // local transfer
    const sender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const senderKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const receiverKey =
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const accounts = await provider.send("eth_accounts", []);

    console.log(provider, accounts);

    const senderWallet = new ethers.Wallet(senderKey, provider);
    const receiverWallet = new ethers.Wallet(receiverKey, provider);

    const senderBalance = await provider.getBalance(senderWallet.address);
    const receiverBalance = await provider.getBalance(receiverWallet.address);
    console.log(
      `Sender balance before transfer: ${ethers.formatEther(senderBalance)} ETH`
    );
    console.log(
      `Receiver balance before transfer: ${ethers.formatEther(
        receiverBalance
      )} ETH`
    );
    const amount = ethers.parseEther("100");

    console.log(
      `Sending ${ethers.formatEther(amount)} ETH from ${sender} to ${receiver}`
    );

    const tx = await senderWallet.sendTransaction({
      to: receiverWallet.address,
      value: amount,
      gasLimit: 21000,
    });

    await tx.wait();

    console.log(`Transaction: ${tx}`);
    console.log(`Transfer completed successfully!`);

    const senderBalanceAfter = await provider.getBalance(senderWallet.address);
    const receiverBalanceAfter = await provider.getBalance(
      receiverWallet.address
    );
    console.log(
      `Sender balance after transfer: ${ethers.formatEther(
        senderBalanceAfter
      )} ETH`
    );
    console.log(
      `Receiver balance after transfer: ${ethers.formatEther(
        receiverBalanceAfter
      )} ETH`
    );
  };

  const handleClaimToken = async () => {
    if (score < 1000) {
      alert("score must be greater than 1000");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const gasOptions = {
        gasLimit: 300000,
      };

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const balance = await contract.balanceOf(address);
      console.log(`Player ${address} has ${balance.toString()} tokens.`);

      const updateScoreTx = await contract.updateScore(
        address,
        score,
        gasOptions
      );
      const updateScore = await updateScoreTx.wait();
      console.log("updateScoreTx", updateScore);

      const tx = await contract.claimTokens(address, gasOptions);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      const response = await fetch("/api", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")!}`,
        },
        body: JSON.stringify({
          action: "sync_score",
          address,
        }),
      });
      console.log("response", response);

      if (response.status === 200) {
        const { score } = await response.json();
        setScore(score);
      }
    } catch (error) {
      console.error("Claim failed:", error);
    }
  };

  const setData = (data: GameStateProp) => {
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setScore(data.score);
  };

  const { signMessageAsync } = useSignMessage();

  const handleSign = async () => {
    try {
      const message = `Welcome to Web3 Blackjack! at ${new Date().toString()}`;
      const signature = await signMessageAsync({ message: message });

      const response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({
          action: "auth",
          address,
          message,
          signature,
        }),
      });

      if (response.status === 200) {
        const { token } = await response.json();
        localStorage.setItem("token", token);

        setIsSigned(true);
        initGame();
      }
    } catch (error) {
      console.log("Sign in failed", error);
    }
  };

  if (!isSigned) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
        <ConnectButton />

        <div>
          {isConnected ? (
            <button
              className="bg-amber-400 rounded-md p-2 cursor-pointer"
              onClick={handleSign}
            >
              Sign with your wallet
            </button>
          ) : (
            <p>Please connect your wallet first</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <button
        className=" bg-amber-400 p-2 rounded-md text-white ml-5"
        onClick={handleTest}
      >
        text transfer
      </button>
      <div className="flex flex-col justify-center items-center gap-4 px-4 mb-10">
        <ConnectButton />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            🃏 Web3 Blackjack
          </h1>
          <h2
            className={`text-2xl font-semibold ${
              message.includes("win") ? "text-green-600" : "text-red-600"
            } transition-colors`}
          >
            <span className={score >= 0 ? "text-green-600" : "text-red-600"}>
              Score: {score}
            </span>

            <span className="ml-5">{message}</span>
            <button
              className=" bg-amber-400 p-2 rounded-md text-white ml-5"
              onClick={handleClaimToken}
            >
              Claim Token
            </button>
          </h2>
        </div>

        {/* 庄家手牌 */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">
            Dealer's Hand
          </h3>
          <div className="flex gap-4 flex-wrap">
            {dealerHand.slice(0, 3).map((card, index) => (
              <div
                key={index}
                className="relative w-28 h-44 bg-white rounded-lg border-2 border-gray-200 shadow-lg flex flex-col justify-between p-4 transition-all hover:scale-105"
              >
                <div className="text-2xl self-start">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.rank}
                  </span>
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
                <div className="text-5xl self-center">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
                <div className="text-2xl self-end transform rotate-180">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.rank}
                  </span>
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 玩家手牌 */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">
            Your Hand
          </h3>
          <div className="flex gap-4 flex-wrap">
            {playerHand.slice(0, 4).map((card, index) => (
              <div
                key={index}
                className="relative w-28 h-44 bg-white rounded-lg border-2 border-gray-200 shadow-lg flex flex-col justify-between p-4 transition-all hover:scale-105"
              >
                <div className="text-2xl self-start">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.rank}
                  </span>
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
                <div className="text-5xl self-center">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
                <div className="text-2xl self-end transform rotate-180">
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.rank}
                  </span>
                  <span
                    className={
                      card.suit === "♥️" || card.suit === "♦️"
                        ? "text-red-600"
                        : "text-black"
                    }
                  >
                    {card.suit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          {message === "" ? (
            <>
              <button
                className="cursor-pointer px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleAction("hit")}
              >
                Hit
              </button>
              <button
                className="cursor-pointer px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleAction("stand")}
              >
                Stand
              </button>
            </>
          ) : (
            <button
              className="cursor-pointer px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              onClick={initGame}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
