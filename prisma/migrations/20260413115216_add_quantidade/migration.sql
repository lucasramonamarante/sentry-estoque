-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_custo" REAL NOT NULL,
    "preco_venda" REAL NOT NULL,
    "quantidade_atual" INTEGER NOT NULL DEFAULT 0,
    "quantidade_minima" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Produto" ("criado_em", "id", "nome", "preco_custo", "preco_venda", "quantidade_minima", "sku") SELECT "criado_em", "id", "nome", "preco_custo", "preco_venda", "quantidade_minima", "sku" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
