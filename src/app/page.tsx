"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const suits = ["♠️", "♥️", "♦️", "♣️"];
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const initialDeck = suits
    .map((suit) => ranks.map((rank) => ({ suit: suit, rank: rank })))
    .flat();

  const [deck, setDeck] = useState<{ suit: string; rank: string }[]>([]);
  const [winner, setWinner] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [playerHand, setPlayerHand] = useState<
    { suit: string; rank: string }[]
  >([]);
  const [dealerHand, setDealerHand] = useState<
    { suit: string; rank: string }[]
  >([]);

  const initGame = async () => {
    const response = await fetch("/api", { method: "GET" });
    const data = await response.json();
    console.log("data", data);

    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setMessage(data.message);
  };

  const handleHit = async () => {
    // const response = await fetch("/api", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ action: "hit" }),
    // });
    // const data = await response.json();
    // console.log("handleHit ", data);
    // setPlayerHand(data.playerHand);
    // setDealerHand(data.dealerHand);
    // setMessage(data.message);
  };

  const handleStand = async () => {
 
  };

  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            🃏 Web3 Blackjack
          </h1>
          <h2
            className={`text-xl font-semibold ${
              winner === "player" ? "text-green-600" : "text-yellow-600"
            } transition-colors`}
          >
            {message}
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
            {playerHand.slice(0, 3).map((card, index) => (
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

        {/* 操作按钮组 */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={handleHit}
          >
            Hit
          </button>
          <button
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={handleStand}
          >
            Stand
          </button>
          <button
            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={initGame}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
