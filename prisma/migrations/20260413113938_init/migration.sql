-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_custo" REAL NOT NULL,
    "preco_venda" REAL NOT NULL,
    "quantidade_minima" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");
