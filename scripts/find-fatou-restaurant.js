const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findFatouRestaurant() {
  try {
    // Chercher le restaurant de Fatou
    const fatouRestaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: 'Fatou' } },
          { name: { contains: 'fatou' } },
          { name: { contains: 'FATOU' } },
          { name: { contains: 'Chez Fatou' } }
        ]
      },
      include: {
        managers: {
          where: { role: 'RESTAURATOR' }
        }
      }
    })

    console.log('🔍 Restaurants de Fatou trouvés:')
    fatouRestaurants.forEach(restaurant => {
      console.log(`- Restaurant: ${restaurant.name}`)
      console.log(`  ID: ${restaurant.id}`)
      console.log(`  Email: ${restaurant.email}`)
      console.log(`  Actif: ${restaurant.active}`)
      console.log(`  Managers:`)
      restaurant.managers.forEach(user => {
        console.log(`    - ${user.name} (${user.email})`)
      })
      console.log('')
    })

    // Aussi chercher l'utilisateur Fatou
    const fatouUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Fatou' } },
          { name: { contains: 'fatou' } },
          { email: { contains: 'fatou' } }
        ],
        role: 'RESTAURATOR'
      },
      include: {
        restaurant: true
      }
    })

    console.log('👤 Utilisateurs Fatou trouvés:')
    fatouUsers.forEach(user => {
      console.log(`- Utilisateur: ${user.name}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Restaurant ID: ${user.restaurantId}`)
      if (user.restaurant) {
        console.log(`  Restaurant: ${user.restaurant.name}`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findFatouRestaurant()