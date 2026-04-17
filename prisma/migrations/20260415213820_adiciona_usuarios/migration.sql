-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movimentacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimentacao_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Movimentacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Movimentacao" ("data", "id", "motivo", "produto_id", "quantidade", "tipo") SELECT "data", "id", "motivo", "produto_id", "quantidade", "tipo" FROM "Movimentacao";
DROP TABLE "Movimentacao";
ALTER TABLE "new_Movimentacao" RENAME TO "Movimentacao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
