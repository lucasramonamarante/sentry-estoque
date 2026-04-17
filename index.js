const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Ferramenta para embaralhar senhas
const jwt = require('jsonwebtoken'); // Ferramenta para o "Crachá Digital"

const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = 'SENTRY_FOQUINHA_SECRET'; // Chave mestra do sistema

app.use(cors());
app.use(express.json());

// --- MÓDULO DE AUTENTICAÇÃO (NOVO) ---

// 1. Cadastro Protegido: Só ADMIN cria novos usuários
app.post('/auth/cadastro', async (req, res) => {
    const { nome, email, senha, perfil, solicitante_perfil } = req.body;

    // Trava de Segurança: Apenas ADMIN ou Gerente pode cadastrar
    if (solicitante_perfil !== 'ADMIN') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem criar usuários.' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        await prisma.usuario.create({
            data: { nome, email, senha: senhaCriptografada, perfil }
        });
        res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar: e-mail já existe.' });
    }
});

// Nova rota para listar a equipe (para o ADM ver quem já está cadastrado)
app.get('/usuarios', async (req, res) => {
    try {
        const equipe = await prisma.usuario.findMany({
            select: { id: true, nome: true, email: true, perfil: true, criado_em: true }
        });
        res.json(equipe);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar equipe.' });
    }
});

// 2. Rota de Login (Validação de credenciais)
app.post('/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        // Verifica se o usuário existe e se a senha "desembaralhada" bate
        if (usuario && await bcrypt.compare(senha, usuario.senha)) {
            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
                SECRET_KEY,
                { expiresIn: '1d' } // Crachá vale por 24 horas
            );
            res.json({ token, usuario: { nome: usuario.nome, perfil: usuario.perfil } });
        } else {
            res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }
    } catch (erro) {
        res.status(500).json({ erro: 'Erro interno no login.' });
    }
});

// --- SUAS ROTAS ORIGINAIS (MANTIDAS) ---

app.get('/', (req, res) => {
    res.json({ mensagem: 'API Sentry-Estoque (Zero Absoluto) rodando com sucesso! 🚀' });
});

app.post('/produtos', async (req, res) => {
    const { sku, nome, preco_custo, preco_venda, quantidade_atual, quantidade_minima } = req.body;
    try {
        const produto = await prisma.produto.create({
            data: { sku, nome, preco_custo, preco_venda, quantidade_atual, quantidade_minima }
        });
        res.status(201).json(produto);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar.' });
    }
});

app.get('/produtos', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({ orderBy: { nome: 'asc' } });
        res.json(produtos);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar.' });
    }
});

app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.produto.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ mensagem: 'Produto deletado com sucesso!' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao deletar produto.' });
    }
});

app.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { sku, nome, preco_custo, preco_venda, quantidade_atual, quantidade_minima } = req.body;
    try {
        const produtoAtualizado = await prisma.produto.update({
            where: { id: parseInt(id) },
            data: { sku, nome, preco_custo, preco_venda, quantidade_atual, quantidade_minima }
        });
        res.json(produtoAtualizado);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao atualizar o produto.' });
    }
});

app.post('/movimentacoes', async (req, res) => {
    const { produto_id, tipo, quantidade, motivo, usuario_id } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const novaMovimentacao = await tx.movimentacao.create({
                data: { produto_id, tipo, quantidade, motivo, usuario_id }
            });

            const operacao = tipo === 'ENTRADA' ? { increment: quantidade } : { decrement: quantidade };
            
            await tx.produto.update({
                where: { id: produto_id },
                data: { quantidade_atual: operacao }
            });

            return novaMovimentacao;
        });
        res.status(201).json(resultado);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao processar a movimentação.' });
    }
});

app.get('/movimentacoes/:produto_id', async (req, res) => {
    const { produto_id } = req.params;
    try {
        const historico = await prisma.movimentacao.findMany({
            where: { produto_id: parseInt(produto_id) },
            orderBy: { data: 'desc' }
        });
        res.json(historico);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar histórico.' });
    }
});

app.get('/dashboard/movimentacoes', async (req, res) => {
    try {
        const movimentacoes = await prisma.movimentacao.findMany({
            include: { produto: true }
        });
        
        const ranking = {};
        movimentacoes.forEach(mov => {
            const nome = mov.produto.nome;
            if (!ranking[nome]) ranking[nome] = 0;
            ranking[nome] += mov.quantidade;
        });

        const dadosGrafico = Object.keys(ranking)
            .map(nome => ({ nome, Movimentacoes: ranking[nome] }))
            .sort((a, b) => b.Movimentacoes - a.Movimentacoes)
            .slice(0, 5);

        res.json(dadosGrafico);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao montar gráfico' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000 com Prisma e SQLite!');
});
// 8. Inteligência: Quem mais vendeu (Ranking de Staff)
app.get('/dashboard/performance-vendas', async (req, res) => {
    try {
        const movimentacoes = await prisma.movimentacao.findMany({
            where: { tipo: 'SAIDA' },
            include: { usuario: true }
        });

        const ranking = {};
        movimentacoes.forEach(mov => {
            const nome = mov.usuario ? mov.usuario.nome : 'Sistema';
            if (!ranking[nome]) ranking[nome] = 0;
            ranking[nome] += mov.quantidade;
        });

        const dados = Object.keys(ranking).map(nome => ({ name: nome, value: ranking[nome] }));
        res.json(dados);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro no ranking de vendas' });
    }
});

// 9. Inteligência: Onde está o dinheiro (Valor por Produto)
app.get('/dashboard/valor-estoque-detalhado', async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany();
        const dados = produtos
            .map(p => ({
                nome: p.nome,
                valorTotal: p.quantidade_atual * p.preco_custo
            }))
            .filter(p => p.valorTotal > 0)
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 5); // Top 5 produtos mais caros em estoque

        res.json(dados);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro no valor detalhado' });
    }
});