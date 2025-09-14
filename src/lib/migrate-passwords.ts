import { db } from './db'
import { hashPassword } from './auth'

export async function migrateAdminPasswords() {
  try {
    console.log('Migration des mots de passe admin...')

    // Récupérer tous les admins
    const admins = await db.admin.findMany()

    for (const admin of admins) {
      // Vérifier si le mot de passe est déjà haché (bcrypt hash commence par $2)
      if (!admin.password.startsWith('$2')) {
        console.log(`Migration du mot de passe pour: ${admin.email}`)
        
        const hashedPassword = await hashPassword(admin.password)
        
        await db.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword }
        })
        
        console.log(`✓ Mot de passe migré pour: ${admin.email}`)
      } else {
        console.log(`✓ Mot de passe déjà sécurisé pour: ${admin.email}`)
      }
    }

    console.log('Migration des mots de passe terminée!')
  } catch (error) {
    console.error('Erreur lors de la migration:', error)
    throw error
  }
}

// Script pour l'exécution directe
if (require.main === module) {
  migrateAdminPasswords()
    .then(() => {
      console.log('Migration réussie!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration échouée:', error)
      process.exit(1)
    })
}