-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produto_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimentacao_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
