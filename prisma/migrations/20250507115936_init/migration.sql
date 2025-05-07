-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_address_key" ON "Player"("address");
