// Start the game and get 2 random cards for dealer and player
// handle the hit and stand and decide who is the winner

import { createPublicClient, createWalletClient, http, verifyMessage } from "viem";
import prisma from "@/lib/client";
import jwt from "jsonwebtoken";
import { hardhat } from "viem/chains";
import { ABI, CONTRACT_ADDRESS } from "@/constants";

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

export interface Card {
  suit: string;
  rank: string;
}

export interface GameStateProp {
  dealerHand: Card[];
  playerHand: Card[];
  deck: Card[];
  message: string;
  score: number;
}

const gameState: GameStateProp = {
  dealerHand: [],
  playerHand: [],
  deck: initialDeck,
  message: "",
  score: 0,
};

function getRandomCard(deck: Card[], noOfCards: number): [Card[], Card[]] {
  const randomeIndexSet = new Set<number>();
  while (randomeIndexSet.size < noOfCards) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    randomeIndexSet.add(randomIndex);
  }

  const randomCards = deck.filter((_, index) => randomeIndexSet.has(index));
  const newDeck = deck.filter((_, index) => !randomeIndexSet.has(index));
  return [randomCards, newDeck];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  if (!address) {
    return new Response(JSON.stringify({ message: "Invalid address" }), {
      status: 400,
    });
  }

  let player = await prisma.player.findUnique({
    where: { address },
  });


  // if the player does not exist, create a new player
  if (!player) {
    player = await prisma.player.create({
      data: { address, score: 0 },
    });
  }

  // initialize the game state
  gameState.score = player.score;

  gameState.deck = [...initialDeck];
  gameState.dealerHand = [];
  gameState.playerHand = [];
  gameState.message = "";

  const [dealerHand, deckAfterDealer] = getRandomCard(gameState.deck, 2);
  const [playerHand, deckAfterPlayer] = getRandomCard(deckAfterDealer, 2);

  gameState.dealerHand = dealerHand;
  gameState.playerHand = playerHand;
  gameState.deck = deckAfterPlayer;

  try {
  } catch (error) {}

  return new Response(
    JSON.stringify({
      playerHand: gameState.playerHand,
      dealerHand: [gameState.dealerHand[0], { suit: "?", rank: "?" } as Card],
      message: gameState.message,
      score: gameState.score,
    }),
    {
      status: 200,
    }
  );
}

// handle the hit and stand and decide who is the winner
export async function POST(request: Request) {
  const body = await request.json();
  const { action, address } = body;

  if (action === "auth") {
    const { message, signature } = body;
    const isValid = await verifyMessage({ address, message, signature });

    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid signature" }), {
        status: 400,
      });
    } else {
      const token = jwt.sign({ address }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      return new Response(
        JSON.stringify({ token, message: "Valid signature" }),
        {
          status: 200,
        }
      );
    }
  }

  // check if the token is valid
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    address: string;
  };
  if (decoded.address.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 401,
    });
  }

  try {
    // return if the current game is finished
    if (gameState.message !== "") {
      return new Response(
        JSON.stringify({
          playerHand: gameState.playerHand,
          dealerHand: gameState.dealerHand,
          message: gameState.message,
        }),
        {
          status: 200,
        }
      );
    }

    // hit: 21 - player wins black jack
    // hit: greater than 21 - player loses, bust
    // hit: less than 21 = continue, update the player hand
    if (action === "hit") {
      const [newCard, newDeck] = getRandomCard(gameState.deck, 1);
      gameState.playerHand.push(...newCard);
      gameState.deck = newDeck;

      const playerValue = calculateHandValue(gameState.playerHand);
      if (playerValue > 21) {
        gameState.message = "You lose! busts!";
        gameState.score -= 100;
      } else if (playerValue === 21) {
        gameState.message = "You win! Black Jack!";
        gameState.score += 100;
      }
    } else if (action === "stand") {
      let dealerValue = calculateHandValue(gameState.dealerHand);
      while (dealerValue < 17) {
        const [newCard, newDeck] = getRandomCard(gameState.deck, 1);
        gameState.dealerHand.push(...newCard);
        gameState.deck = newDeck;
        dealerValue = calculateHandValue(gameState.dealerHand);
      }

      const playerValue = calculateHandValue(gameState.playerHand);
      // stand: 21 - dealer wins, black jack
      // stand: greate than 21 - player win, dealer bust
      // stand: less than 21 -
      // dealer hand > player hand: dealer wins
      // dealer hand < player hand: player wins
      // dealer hand = player hand : draw

      if (dealerValue > 21) {
        gameState.message = "You win! Dealer busts!";
        gameState.score += 100;
      } else if (dealerValue === 21) {
        gameState.message = "You lose! Black Jack!";
        gameState.score -= 100;
      } else {
        if (dealerValue > playerValue) {
          gameState.message = "You lose";
          gameState.score -= 100;
        } else if (dealerValue < playerValue) {
          gameState.message = "You win";
          gameState.score += 100;
        } else {
          gameState.message = "Draw!";
        }
      }
    } else if (action === "sync_score") {
      // update the player score from the contract
      const client = createPublicClient({
        chain: hardhat,
        transport: http(),
      });

      // read the score from the contract
      const chainScore = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "scores",
        args: [address],
      });

      // update the player score in the database
      const player = await prisma.player.update({
        where: { address },
        data: { score: Number(chainScore) },
      });

      return new Response(JSON.stringify({ score: player.score }), {
        status: 200,
      });
    }

    // update the player score
    await prisma.player.update({
      where: { address },
      data: { score: gameState.score },
    });

    return new Response(
      JSON.stringify({
        playerHand: gameState.playerHand,
        dealerHand:
          gameState.message !== ""
            ? gameState.dealerHand
            : [gameState.dealerHand[0], { suit: "?", rank: "?" } as Card],
        message: gameState.message,
        score: gameState.score,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
    });
  
}

function calculateHandValue(hand: Card[]): number {
  let value = 0;
  let acesCount = 0;
  hand.forEach((card) => {
    if (card.rank === "A") {
      acesCount++;
      value += 11;
    } else if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  });

  while (value > 21 && acesCount > 0) {
    value -= 10;
    acesCount--;
  }
  return value;
}
