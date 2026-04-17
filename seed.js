const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando a criação do usuário Mestre na Nuvem...');

    const senhaCriptografada = await bcrypt.hash('56124951mlk', 10);

    const admin = await prisma.usuario.upsert({
        where: { email: 'lucas.amarante-ceo@techsentry.info' },
        update: {}, 
        create: {
            nome: 'Lucas Amarante (CEO)',
            email: 'lucas.amarante-ceo@techsentry.info',
            senha: senhaCriptografada,
            perfil: 'ADMIN'
        }
    });

    console.log('✅ Usuário ADMIN criado com sucesso no Supabase!');
    console.log(`Nome: ${admin.nome} | E-mail: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });