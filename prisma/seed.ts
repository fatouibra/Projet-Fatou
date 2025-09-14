import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding de la marketplace MnuFood Dakar...')

  // Créer l'administrateur par défaut
  console.log('👤 Création de l\'administrateur...')
  const hashedAdminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mnufood.com' },
    update: {},
    create: {
      email: 'admin@mnufood.com',
      name: 'Administrateur MnuFood',
      password: hashedAdminPassword,
      role: 'ADMIN'
    }
  })

  // Créer les catégories
  console.log('📂 Création des catégories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-entrees' },
      update: {},
      create: {
        id: 'cat-entrees',
        name: 'Entrées',
        description: 'Délicieuses entrées pour commencer votre repas',
        order: 0,
        active: true
      }
    }),
    prisma.category.upsert({
      where: { id: 'cat-plats' },
      update: {},
      create: {
        id: 'cat-plats',
        name: 'Plats principaux',
        description: 'Nos spécialités et plats traditionnels',
        order: 1,
        active: true
      }
    }),
    prisma.category.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: {
        id: 'cat-desserts',
        name: 'Desserts',
        description: 'Douceurs pour terminer en beauté',
        order: 2,
        active: true
      }
    }),
    prisma.category.upsert({
      where: { id: 'cat-boissons' },
      update: {},
      create: {
        id: 'cat-boissons',
        name: 'Boissons',
        description: 'Boissons fraîches et chaudes',
        order: 3,
        active: true
      }
    })
  ])

  // Restaurants de Dakar avec leurs plats
  console.log('🏪 Création des restaurants de Dakar...')
  
  // 1. Chez Fatou - Cuisine Sénégalaise
  const chezFatou = await prisma.restaurant.create({
    data: {
      name: 'Chez Fatou',
      description: 'Restaurant traditionnel sénégalais au cœur de Dakar, spécialiste du thieboudienne et des grillades',
      address: 'Avenue Cheikh Anta Diop, Dakar, Sénégal',
      phone: '+221 77 123 45 67',
      email: 'contact@chezfatou.sn',
      image: '/placeholder-restaurant.jpg',
      rating: 4.8,
      cuisine: 'Sénégalaise',
      deliveryFee: 1500,
      minOrderAmount: 5000,
      openingHours: '11h00 - 23h00',
      isActive: true
    }
  })

  // Créer le manager pour Chez Fatou
  const hashedFatouPassword = await bcrypt.hash('fatou123', 12)
  await prisma.user.upsert({
    where: { email: 'fatou@chezfatou.sn' },
    update: {
      restaurantId: chezFatou.id,
      permissions: 'dashboard,products,orders,profile,finances'
    },
    create: {
      email: 'fatou@chezfatou.sn',
      name: 'Fatou Diallo',
      password: hashedFatouPassword,
      phone: '+221 77 123 45 67',
      role: 'RESTAURATOR',
      restaurantId: chezFatou.id,
      permissions: 'dashboard,products,orders,profile,finances'
    }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Thiéboudienne Rouge',
        description: 'Plat national sénégalais : riz au poisson avec légumes et sauce tomate',
        price: 3500,
        image: '/placeholder/photo-1546833999-b9f581a1996d?w=400',
        restaurantId: chezFatou.id,
        categoryId: 'cat-plats',
        featured: true,
        isPopular: true,
        active: true
      },
      {
        name: 'Thiéboudienne Blanc',
        description: 'Version blanche du plat traditionnel avec poisson frais et légumes',
        price: 3200,
        image: '/placeholder/photo-1565299624946-b28f40a0ca4b?w=400',
        restaurantId: chezFatou.id,
        categoryId: 'cat-plats',
        isPopular: true,
        active: true
      },
      {
        name: 'Yassa Poulet',
        description: 'Poulet mariné aux oignons et citron, servi avec du riz blanc',
        price: 2800,
        image: '/placeholder/photo-1598103442097-8b74394b95c6?w=400',
        restaurantId: chezFatou.id,
        categoryId: 'cat-plats',
        active: true
      },
      {
        name: 'Attaya (Thé sénégalais)',
        description: 'Thé vert traditionnel préparé selon la coutume wolof',
        price: 500,
        image: '/placeholder/photo-1556679343-c7306c1976bc?w=400',
        restaurantId: chezFatou.id,
        categoryId: 'cat-boissons',
        active: true
      }
    ]
  })

  // 2. Le Lagon - Cuisine de la Mer
  const leLagon = await prisma.restaurant.create({
    data: {
      name: 'Le Lagon',
      description: 'Restaurant de fruits de mer avec vue sur l\'océan Atlantique, spécialités de poissons frais',
      address: 'Corniche Ouest, Almadies, Dakar',
      phone: '+221 33 820 15 35',
      email: 'reservation@lelagon-dakar.com',
      image: '/placeholder/photo-1517248135467-4c7edcad34c4?w=600',
      rating: 4.6,
      cuisine: 'Fruits de mer',
      deliveryFee: 2000,
      minOrderAmount: 6000,
      openingHours: '12h00 - 00h00',
      isActive: true
    }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Capitaine Grillé',
        description: 'Poisson capitaine grillé aux épices, accompagné de riz jollof',
        price: 4500,
        image: '/placeholder/photo-1519708227418-c8fd9a32b7a2?w=400',
        restaurantId: leLagon.id,
        categoryId: 'cat-plats',
        featured: true,
        active: true
      },
      {
        name: 'Plateau de Fruits de Mer',
        description: 'Assortiment de crevettes, langoustes et poissons grillés',
        price: 8500,
        image: '/placeholder/photo-1551218808-94e220e084d2?w=400',
        restaurantId: leLagon.id,
        categoryId: 'cat-plats',
        featured: true,
        isPopular: true,
        active: true
      },
      {
        name: 'Salade de Pieuvre',
        description: 'Salade fraîche de pieuvre aux tomates et oignons',
        price: 2200,
        image: '/placeholder/photo-1540420773420-3366772f4999?w=400',
        restaurantId: leLagon.id,
        categoryId: 'cat-entrees',
        active: true
      }
    ]
  })

  // 3. Teranga Express - Fast Food Africain
  const terangaExpress = await prisma.restaurant.create({
    data: {
      name: 'Teranga Express',
      description: 'Fast food africain moderne, fusion entre tradition et modernité',
      address: 'Rue 6, Point E, Dakar',
      phone: '+221 76 987 65 43',
      email: 'hello@teranga-express.sn',
      image: '/placeholder/photo-1552566575-ad4b754f4dc5?w=600',
      rating: 4.4,
      cuisine: 'Fast Food Africain',
      deliveryFee: 1000,
      minOrderAmount: 3000,
      openingHours: '10h00 - 02h00',
      isActive: true
    }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Burger Yassa',
        description: 'Burger au poulet yassa avec sauce spéciale et frites de patate douce',
        price: 2500,
        image: '/placeholder/photo-1571091718767-18b5b1457add?w=400',
        restaurantId: terangaExpress.id,
        categoryId: 'cat-plats',
        isNew: true,
        isPopular: true,
        active: true
      },
      {
        name: 'Wrap Dibi',
        description: 'Wrap à la viande grillée sénégalaise avec crudités',
        price: 1800,
        image: '/placeholder/photo-1565299507177-b0ac66763828?w=400',
        restaurantId: terangaExpress.id,
        categoryId: 'cat-plats',
        isNew: true,
        active: true
      },
      {
        name: 'Smoothie Bissap',
        description: 'Smoothie à l\'hibiscus avec fruits tropicaux',
        price: 1200,
        image: '/placeholder/photo-1553530666-ba11a7da3888?w=400',
        restaurantId: terangaExpress.id,
        categoryId: 'cat-boissons',
        isVegetarian: true,
        active: true
      }
    ]
  })

  // 4. Chez Rama - Cuisine Libanaise
  const chezRama = await prisma.restaurant.create({
    data: {
      name: 'Chez Rama',
      description: 'Authentique cuisine libanaise à Dakar, mezze et grillades traditionnelles',
      address: 'Rue Carnot, Plateau, Dakar',
      phone: '+221 33 821 78 90',
      email: 'contact@chezrama.sn',
      image: '/placeholder/photo-1514933651103-005eec06c04b?w=600',
      rating: 4.7,
      cuisine: 'Libanaise',
      deliveryFee: 1200,
      minOrderAmount: 4000,
      openingHours: '11h30 - 23h30',
      isActive: true
    }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Mezze Complet',
        description: 'Assortiment de houmous, taboulé, fattoush et kebbé',
        price: 3800,
        image: '/placeholder/photo-1541014741259-de529411b96a?w=400',
        restaurantId: chezRama.id,
        categoryId: 'cat-entrees',
        featured: true,
        isVegetarian: true,
        active: true
      },
      {
        name: 'Chawarma Agneau',
        description: 'Chawarma d\'agneau mariné avec sauce tahini et crudités',
        price: 2200,
        image: '/placeholder/photo-1529006557810-274b9b2fc783?w=400',
        restaurantId: chezRama.id,
        categoryId: 'cat-plats',
        isPopular: true,
        active: true
      },
      {
        name: 'Baklava Maison',
        description: 'Pâtisserie libanaise aux noix et miel',
        price: 1500,
        image: '/placeholder/photo-1571877227200-a0d98ea607e9?w=400',
        restaurantId: chezRama.id,
        categoryId: 'cat-desserts',
        active: true
      }
    ]
  })

  // 5. Pizza Corner - Pizzeria
  const pizzaCorner = await prisma.restaurant.create({
    data: {
      name: 'Pizza Corner',
      description: 'Pizzeria italienne avec des ingrédients frais et pâte artisanale',
      address: 'Avenue Bourguiba, Mermoz, Dakar',
      phone: '+221 77 456 78 90',
      email: 'order@pizzacorner.sn',
      image: '/placeholder/photo-1513104890138-7c749659a591?w=600',
      rating: 4.3,
      cuisine: 'Italienne',
      deliveryFee: 800,
      minOrderAmount: 2500,
      openingHours: '18h00 - 01h00',
      isActive: true
    }
  })

  await prisma.product.createMany({
    data: [
      {
        name: 'Pizza Margherita',
        description: 'Pizza classique avec tomates, mozzarella et basilic frais',
        price: 4200,
        image: '/placeholder/photo-1565299624946-b28f40a0ca4b?w=400',
        restaurantId: pizzaCorner.id,
        categoryId: 'cat-plats',
        isVegetarian: true,
        active: true
      },
      {
        name: 'Pizza Thiof',
        description: 'Pizza spéciale au poisson thiof fumé et légumes locaux',
        price: 5500,
        image: '/placeholder/photo-1571997478779-2adcbbe9ab2f?w=400',
        restaurantId: pizzaCorner.id,
        categoryId: 'cat-plats',
        featured: true,
        isNew: true,
        active: true
      },
      {
        name: 'Tiramisu',
        description: 'Dessert italien traditionnel au café et mascarpone',
        price: 1800,
        image: '/placeholder/photo-1571877227200-a0d98ea607e9?w=400',
        restaurantId: pizzaCorner.id,
        categoryId: 'cat-desserts',
        active: true
      }
    ]
  })

  // Créer un restaurant de test pour les développeurs
  const demoRestaurant = await prisma.restaurant.create({
    data: {
      name: 'Restaurant Demo',
      description: 'Restaurant de démonstration pour les tests',
      address: 'Avenue Léopold Sédar Senghor, Dakar',
      phone: '+221 33 555 03 04',
      email: 'contact@demo.com',
      cuisine: 'Internationale',
      deliveryFee: 1000,
      minOrderAmount: 2500,
      rating: 4.0,
      isActive: true
    }
  })

  const hashedDemoPassword = await bcrypt.hash('demo123', 12)
  await prisma.user.upsert({
    where: { email: 'demo@restaurant.com' },
    update: {
      restaurantId: demoRestaurant.id,
      permissions: 'dashboard,products,orders,profile,finances'
    },
    create: {
      email: 'demo@restaurant.com',
      name: 'Demo Manager',
      password: hashedDemoPassword,
      phone: '+221 77 555 01 02',
      role: 'RESTAURATOR',
      restaurantId: demoRestaurant.id,
      permissions: 'dashboard,products,orders,profile,finances'
    }
  })

  console.log('✅ Seeding terminé avec succès!')
  console.log(`👤 Admin créé: ${admin.email} / mot de passe: admin123`)
  console.log('🏪 5 restaurants de Dakar créés avec leurs plats + 1 restaurant demo:')
  console.log('   • Chez Fatou (Sénégalaise) - fatou@chezfatou.sn / fatou123')
  console.log('   • Le Lagon (Fruits de mer)')
  console.log('   • Teranga Express (Fast Food Africain)')
  console.log('   • Chez Rama (Libanaise)')
  console.log('   • Pizza Corner (Italienne)')
  console.log('   • Restaurant Demo (Test) - demo@restaurant.com / demo123')
  console.log('📂 4 catégories créées')
  console.log('🍽️ Environ 18 plats créés au total')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })