import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function migrateToUnifiedRoles() {
  console.log('🚀 Début de la migration vers le système de rôles unifié...')

  try {
    console.log('📝 Les tables Admin et RestaurantManager ont été supprimées lors de la migration du schéma.')
    console.log('📝 Les données ont été perdues, nous allons créer des utilisateurs par défaut.')

    // Créer un admin par défaut si aucun n'existe
    console.log('🔧 Vérification de l\'admin par défaut...')
    
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminExists) {
      const defaultPassword = await hashPassword('admin123')
      
      await prisma.user.create({
        data: {
          email: 'admin@mnufood.com',
          name: 'Administrateur',
          password: defaultPassword,
          role: 'ADMIN',
          isActive: true
        }
      })
      
      console.log('✅ Admin par défaut créé: admin@mnufood.com / admin123')
    }

    // Migrer les utilisateurs clients existants s'ils existent
    console.log('📝 Migration des clients...')
    
    const oldUsers = await prisma.user.findMany({
      where: {
        password: null // Les anciens clients n'avaient pas de mot de passe
      }
    })

    for (const user of oldUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'CUSTOMER'
        }
      })
    }

    console.log(`✅ ${oldUsers.length} clients migrés`)

    // 5. Statistiques finales
    console.log('\n📊 Statistiques de migration:')
    
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    stats.forEach(stat => {
      console.log(`   - ${stat.role}: ${stat._count} utilisateurs`)
    })

    console.log('\n🎉 Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  }
}

// Script pour nettoyer les anciennes tables (ATTENTION: destructif)
async function cleanupOldTables() {
  console.log('🧹 Nettoyage des anciennes tables...')
  
  try {
    // Supprimer les anciennes données (commenté par sécurité)
    // await prisma.admin.deleteMany()
    // await prisma.restaurantManager.deleteMany()
    
    console.log('✅ Nettoyage terminé')
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateToUnifiedRoles()
    .then(() => {
      console.log('\n💡 Pour nettoyer les anciennes tables, exécutez:')
      console.log('   npx ts-node scripts/migrate-to-unified-roles.ts --cleanup')
    })
    .catch((error) => {
      console.error('Migration échouée:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  // Si l'option --cleanup est passée
  if (process.argv.includes('--cleanup')) {
    cleanupOldTables()
  }
}

export { migrateToUnifiedRoles, cleanupOldTables }