"use client";
import { useEffect, useState } from "react";
import { GameStateProp } from "./api/route";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

export default function Page() {
  const [message, setMessage] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [playerHand, setPlayerHand] = useState<
    { suit: string; rank: string }[]
  >([]);
  const [dealerHand, setDealerHand] = useState<
    { suit: string; rank: string }[]
  >([]);

  const { address } = useAccount();
  const [isSigned, setIsSigned] = useState<boolean>(false);

  const initGame = async () => {
    const response = await fetch("/api", { method: "GET" });
    const data = await response.json();

    setData(data);
  };

  const handleAction = async (action: string) => {
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    const data = await response.json();

    setData(data);
  };

  const setData = (data: GameStateProp) => {
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
    setScore(data.score);
  };

  useEffect(() => {
    initGame();
  }, []);

  const { signMessageAsync } = useSignMessage();

  const handleSignIn = async () => {
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
        setIsSigned(true);
        console.log("Sign in successfully");
      }

      if (!isSigned) {
        return (
          <div className="flex flex-col justify-center items-center gap-4 px-4 mb-10">
            <ConnectButton />

            <button
              className="bg-amber-400 rounded-md p-2 cursor-pointer"
              onClick={handleSignIn}
            >
              Sign with your wallet
            </button>
          </div>
        );
      }
    } catch (error) {
      console.log("Sign in failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="flex flex-col justify-center items-center gap-4 px-4 mb-10">
        <ConnectButton />

        <button
          className="bg-amber-400 rounded-md p-2 cursor-pointer"
          onClick={handleSignIn}
        >
          Sign with your wallet
        </button>
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
