const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const FATOU_RESTAURANT_ID = 'cmfg5n69k0001vzf4vpmw78ck'

async function createTestDataForFatou() {
  try {
    console.log('🚀 Création des données de test pour Chez Fatou...')

    // 1. Créer des catégories pour le restaurant
    const categories = await createCategories()
    console.log(`✅ ${categories.length} catégories créées`)

    // 2. Créer des produits
    const products = await createProducts(categories)
    console.log(`✅ ${products.length} produits créés`)

    // 3. Créer des clients de test
    const customers = await createCustomers()
    console.log(`✅ ${customers.length} clients créés`)

    // 4. Créer des commandes
    const orders = await createOrders(customers, products)
    console.log(`✅ ${orders.length} commandes créées`)

    // 5. Créer des avis
    const reviews = await createReviews(customers, orders, products)
    console.log(`✅ ${reviews.length} avis créés`)

    // 6. Mettre à jour les statistiques du restaurant
    await updateRestaurantStats()
    console.log('✅ Statistiques du restaurant mises à jour')

    console.log('')
    console.log('🎉 Données de test créées avec succès pour Chez Fatou !')
    console.log('Fatou peut maintenant voir ses finances, avis et profil.')

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createCategories() {
  const categoriesData = [
    { name: 'Plats principaux', description: 'Nos spécialités sénégalaises', order: 1 },
    { name: 'Accompagnements', description: 'Riz, légumes et sauces', order: 2 },
    { name: 'Boissons', description: 'Jus naturels et boissons', order: 3 },
    { name: 'Desserts', description: 'Desserts traditionnels', order: 4 }
  ]

  const categories = []
  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: {
        ...catData,
        restaurantId: FATOU_RESTAURANT_ID,
        active: true
      }
    })
    categories.push(category)
  }
  
  return categories
}

async function createProducts(categories) {
  const productsData = [
    // Plats principaux
    { name: 'Thiéboudienne au poisson', description: 'Riz au poisson avec légumes, spécialité du Sénégal', price: 2500, category: 0, featured: true, isPopular: true },
    { name: 'Mafé au boeuf', description: 'Ragoût de boeuf à la sauce d\'arachide', price: 2200, category: 0, featured: true },
    { name: 'Yassa poulet', description: 'Poulet mariné aux oignons et citron', price: 2000, category: 0, isNew: true },
    { name: 'Thiou boeuf', description: 'Ragoût de boeuf aux légumes', price: 2300, category: 0 },
    { name: 'Ceebu yapp', description: 'Riz à la viande rouge', price: 2400, category: 0, isPopular: true },
    
    // Accompagnements
    { name: 'Riz blanc', description: 'Riz basmati parfumé', price: 500, category: 1, isVegetarian: true },
    { name: 'Attaya', description: 'Thé à la menthe traditionnel', price: 300, category: 1, isVegetarian: true },
    { name: 'Pain traditionnel', description: 'Pain cuit au four à bois', price: 200, category: 1, isVegetarian: true },
    
    // Boissons
    { name: 'Jus de bissap', description: 'Jus d\'hibiscus naturel', price: 800, category: 2, isVegetarian: true, featured: true },
    { name: 'Jus de gingembre', description: 'Boisson épicée rafraîchissante', price: 800, category: 2, isVegetarian: true },
    { name: 'Jus de ditax', description: 'Jus de fruit traditionnel', price: 900, category: 2, isVegetarian: true },
    { name: 'Eau minérale', description: 'Eau plate 50cl', price: 400, category: 2, isVegetarian: true },
    
    // Desserts
    { name: 'Thiakry', description: 'Dessert au mil et lait caillé', price: 600, category: 3, isVegetarian: true },
    { name: 'Sombi', description: 'Riz au lait à la vanille', price: 550, category: 3, isVegetarian: true }
  ]

  const products = []
  for (const prodData of productsData) {
    const product = await prisma.product.create({
      data: {
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        categoryId: categories[prodData.category].id,
        restaurantId: FATOU_RESTAURANT_ID,
        featured: prodData.featured || false,
        isNew: prodData.isNew || false,
        isPopular: prodData.isPopular || false,
        isVegetarian: prodData.isVegetarian || false,
        active: true,
        rating: Math.random() * 2 + 3, // Entre 3 et 5
        likesCount: Math.floor(Math.random() * 50) + 10 // Entre 10 et 60
      }
    })
    products.push(product)
  }
  
  return products
}

async function createCustomers() {
  const customersData = [
    { name: 'Amadou Diop', email: 'amadou.diop@email.sn', phone: '+221 77 123 45 67' },
    { name: 'Aissatou Sy', email: 'aissatou.sy@email.sn', phone: '+221 76 234 56 78' },
    { name: 'Mamadou Ba', email: 'mamadou.ba@email.sn', phone: '+221 78 345 67 89' },
    { name: 'Ndeye Fall', email: 'ndeye.fall@email.sn', phone: '+221 77 456 78 90' },
    { name: 'Ousmane Ndiaye', email: 'ousmane.ndiaye@email.sn', phone: '+221 76 567 89 01' },
    { name: 'Mariama Cissé', email: 'mariama.cisse@email.sn', phone: '+221 78 678 90 12' }
  ]

  const customers = []
  for (const custData of customersData) {
    // Vérifier si le client existe déjà
    let customer = await prisma.user.findUnique({
      where: { email: custData.email }
    })

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          ...custData,
          role: 'CUSTOMER',
          isActive: true
        }
      })
    }
    customers.push(customer)
  }
  
  return customers
}

async function createOrders(customers, products) {
  const orders = []
  const statuses = ['DELIVERED', 'PREPARING', 'READY', 'RECEIVED']
  const statusWeights = [70, 10, 10, 10] // 70% livrées
  
  // Créer des commandes sur les 30 derniers jours
  for (let i = 0; i < 45; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30))
    
    // Choisir un statut selon les poids
    const rand = Math.random() * 100
    let status = 'DELIVERED'
    let cumul = 0
    for (let j = 0; j < statuses.length; j++) {
      cumul += statusWeights[j]
      if (rand <= cumul) {
        status = statuses[j]
        break
      }
    }
    
    // Sélectionner 1-4 produits aléatoires
    const numProducts = Math.floor(Math.random() * 4) + 1
    const orderProducts = []
    let total = 0
    
    for (let j = 0; j < numProducts; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const subtotal = product.price * quantity
      
      orderProducts.push({
        productId: product.id,
        quantity,
        price: product.price
      })
      
      total += subtotal
    }
    
    const address = `${Math.floor(Math.random() * 999) + 1} Avenue ${['Léopold Sédar Senghor', 'Bourguiba', 'Lamine Guèye'][Math.floor(Math.random() * 3)]}, Dakar`
    
    const orderNumber = `CHF${Date.now()}${String(i).padStart(3, '0')}`
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        restaurantId: FATOU_RESTAURANT_ID,
        status,
        total,
        address,
        customerName: customer.name,
        customerPhone: customer.phone,
        createdAt: orderDate,
        updatedAt: status === 'DELIVERED' ? new Date(orderDate.getTime() + 2 * 60 * 60 * 1000) : orderDate,
        items: {
          create: orderProducts
        }
      }
    })
    
    orders.push(order)
  }
  
  return orders
}

async function createReviews(customers, orders, products) {
  const reviews = []
  const comments = [
    "Excellent plat, très authentique !",
    "Délicieux, je recommande vivement",
    "Service rapide et nourriture savoureuse",
    "Un vrai régal, comme chez ma grand-mère",
    "Parfait, livraison à l'heure",
    "Très bon restaurant sénégalais",
    "Qualité au rendez-vous",
    "Portion généreuse et goût excellent",
    "Je reviendrai sans hésiter",
    "Authentique cuisine sénégalaise"
  ]
  
  // Créer des avis pour les commandes livrées
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED')
  
  for (let i = 0; i < Math.min(30, deliveredOrders.length); i++) {
    const order = deliveredOrders[i]
    const customer = customers.find(c => c.id === order.userId)
    
    // 80% de chance d'avoir un avis
    if (Math.random() < 0.8) {
      const rating = Math.random() < 0.7 ? 
        Math.floor(Math.random() * 2) + 4 : // 70% entre 4-5
        Math.floor(Math.random() * 5) + 1   // 30% entre 1-5
      
      const hasComment = Math.random() < 0.7
      const comment = hasComment ? comments[Math.floor(Math.random() * comments.length)] : null
      
      // Parfois associer à un produit spécifique
      const hasProduct = Math.random() < 0.3
      const product = hasProduct ? products[Math.floor(Math.random() * products.length)] : null
      
      const review = await prisma.review.create({
        data: {
          rating,
          comment,
          customerName: customer.name,
          customerEmail: customer.email,
          restaurantId: FATOU_RESTAURANT_ID,
          productId: product?.id || null,
          createdAt: new Date(order.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        }
      })
      
      reviews.push(review)
    }
  }
  
  return reviews
}

async function updateRestaurantStats() {
  // Calculer et mettre à jour la note moyenne
  const avgRating = await prisma.review.aggregate({
    where: { restaurantId: FATOU_RESTAURANT_ID },
    _avg: { rating: true }
  })
  
  // Compter les likes (simulé)
  const likesCount = Math.floor(Math.random() * 200) + 150
  
  await prisma.restaurant.update({
    where: { id: FATOU_RESTAURANT_ID },
    data: {
      rating: avgRating._avg.rating || 4.2,
      likesCount,
      isActive: true
    }
  })
}

createTestDataForFatou()