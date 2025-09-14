const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDefaultAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (adminExists) {
      console.log('✅ Un administrateur existe déjà:', adminExists.email)
      return
    }

    // Créer l'admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mnufood.com',
        name: 'Administrateur',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Administrateur par défaut créé:')
    console.log('   Email: admin@mnufood.com')
    console.log('   Mot de passe: admin123')
    console.log('   ID:', admin.id)

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultAdmin()