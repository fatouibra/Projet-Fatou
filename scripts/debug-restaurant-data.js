const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugRestaurantData() {
  try {
    console.log('🔍 Debugging data for both restaurant IDs...\n')
    
    const CORRECT_ID = 'cmfg5n69k0001vzf4vpmw78ck'
    const WRONG_ID = 'cmf1nnt0d000xuhkqie73axzv'
    
    // Check Fatou's current data
    console.log('👤 Fatou Diallo:')
    const fatou = await prisma.user.findUnique({
      where: { email: 'fatou@chezfatou.sn' }
    })
    console.log(`  - Restaurant ID: ${fatou?.restaurantId}`)
    console.log(`  - Role: ${fatou?.role}`)
    console.log('')
    
    // Check both restaurants
    for (const [name, id] of [['CORRECT', CORRECT_ID], ['WRONG', WRONG_ID]]) {
      console.log(`🏪 ${name} Restaurant (${id}):`)
      
      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
          managers: true,
          products: true,
          orders: true,
          reviews: true,
          categories: true
        }
      })
      
      if (restaurant) {
        console.log(`  - Nom: ${restaurant.name}`)
        console.log(`  - Email: ${restaurant.email}`)
        console.log(`  - Managers: ${restaurant.managers.length}`)
        console.log(`  - Catégories: ${restaurant.categories.length}`)
        console.log(`  - Produits: ${restaurant.products.length}`)
        console.log(`  - Commandes: ${restaurant.orders.length}`)
        console.log(`  - Avis: ${restaurant.reviews.length}`)
        
        if (restaurant.managers.length > 0) {
          console.log('  - Managers details:')
          restaurant.managers.forEach(manager => {
            console.log(`    * ${manager.name} (${manager.email})`)
          })
        }
      } else {
        console.log('  ❌ Restaurant non trouvé')
      }
      console.log('')
    }
    
    // Check all users with RESTAURATOR role
    console.log('👥 All RESTAURATOR users:')
    const restaurators = await prisma.user.findMany({
      where: { role: 'RESTAURATOR' },
      select: {
        name: true,
        email: true,
        restaurantId: true
      }
    })
    
    restaurators.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.restaurantId}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugRestaurantData()