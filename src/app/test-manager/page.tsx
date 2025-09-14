'use client'

import { useState } from 'react'

export default function TestManager() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const createTestManager = async () => {
    setLoading(true)
    setResult('')

    try {
      // D'abord créer un restaurant
      const restaurantResponse = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Restaurant Test',
          email: 'test@restaurant.com',
          phone: '+221 77 123 45 67',
          address: 'Dakar, Sénégal',
          cuisine: 'Sénégalaise',
          deliveryFee: 1500,
          minOrderAmount: 3000
        })
      })

      const restaurantData = await restaurantResponse.json()
      
      if (!restaurantData.success) {
        throw new Error('Erreur lors de la création du restaurant: ' + restaurantData.error)
      }

      // Ensuite créer un gestionnaire
      const managerResponse = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Gestionnaire Test',
          email: 'test@manager.com',
          phone: '+221 77 123 45 68',
          restaurantId: restaurantData.data.id,
          permissions: ['MANAGE_MENU', 'MANAGE_ORDERS', 'VIEW_ANALYTICS'],
          password: 'password123'
        })
      })

      const managerData = await managerResponse.json()
      
      if (managerData.success) {
        setResult(`✅ Gestionnaire créé avec succès!
        
Email: test@manager.com
Mot de passe: password123
Restaurant: Restaurant Test
        
Tu peux maintenant utiliser ces identifiants pour te connecter!`)
      } else {
        setResult('❌ Erreur: ' + managerData.error)
      }
    } catch (error) {
      setResult('❌ Erreur: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkManagers = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/restaurant-managers/list')
      const data = await response.json()
      
      if (data.success) {
        if (data.managers.length === 0) {
          setResult('❌ Aucun gestionnaire trouvé dans la base de données')
        } else {
          setResult(`✅ ${data.managers.length} gestionnaire(s) trouvé(s):
          
${data.managers.map((m: any) => `- ${m.name} (${m.email}) - Restaurant: ${m.restaurantName}`).join('\n')}`)
        }
      } else {
        setResult('❌ Erreur API: ' + data.error)
      }
    } catch (error) {
      setResult('❌ Erreur réseau: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Test Gestionnaire Restaurant</h1>
          
          <div className="space-y-4">
            <button
              onClick={checkManagers}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Vérifier les gestionnaires existants'}
            </button>
            
            <button
              onClick={createTestManager}
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer un gestionnaire de test'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}