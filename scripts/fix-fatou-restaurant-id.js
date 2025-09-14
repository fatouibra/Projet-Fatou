const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const CORRECT_RESTAURANT_ID = 'cmfg5n69k0001vzf4vpmw78ck'
const WRONG_RESTAURANT_ID = 'cmf1nnt0d000xuhkqie73axzv'

async function fixFatouRestaurantId() {
  try {
    console.log('🔍 Recherche de l\'utilisateur Fatou...')
    
    // Trouver Fatou
    const fatou = await prisma.user.findUnique({
      where: { email: 'fatou@chezfatou.sn' }
    })
    
    if (!fatou) {
      console.log('❌ Utilisateur Fatou non trouvé')
      return
    }
    
    console.log('👤 Fatou trouvée:')
    console.log(`  - Nom: ${fatou.name}`)
    console.log(`  - Email: ${fatou.email}`)
    console.log(`  - Restaurant ID actuel: ${fatou.restaurantId}`)
    
    if (fatou.restaurantId === CORRECT_RESTAURANT_ID) {
      console.log('✅ L\'ID du restaurant est déjà correct!')
      return
    }
    
    // Mettre à jour l'ID du restaurant
    console.log('')
    console.log(`🔄 Mise à jour de l'ID restaurant de ${fatou.restaurantId} vers ${CORRECT_RESTAURANT_ID}...`)
    
    const updatedFatou = await prisma.user.update({
      where: { email: 'fatou@chezfatou.sn' },
      data: { restaurantId: CORRECT_RESTAURANT_ID }
    })
    
    console.log('✅ ID restaurant mis à jour avec succès!')
    console.log(`  - Nouveau Restaurant ID: ${updatedFatou.restaurantId}`)
    
    // Vérifier le restaurant cible
    console.log('')
    console.log('🔍 Vérification du restaurant cible...')
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: CORRECT_RESTAURANT_ID },
      include: {
        managers: true,
        products: true,
        orders: true,
        reviews: true
      }
    })
    
    if (restaurant) {
      console.log('🏪 Restaurant trouvé:')
      console.log(`  - Nom: ${restaurant.name}`)
      console.log(`  - Managers: ${restaurant.managers.length}`)
      console.log(`  - Produits: ${restaurant.products.length}`)
      console.log(`  - Commandes: ${restaurant.orders.length}`)
      console.log(`  - Avis: ${restaurant.reviews.length}`)
    }
    
    console.log('')
    console.log('🎉 Correction terminée! Fatou peut maintenant voir ses données.')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFatouRestaurantId()