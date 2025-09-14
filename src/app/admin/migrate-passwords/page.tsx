'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, AlertCircle, Key, Shield } from 'lucide-react'

export default function MigratePasswordsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; migratedCount?: number } | null>(null)

  const handleMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/admin/migrate-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Migration error:', error)
      setResult({
        success: false,
        message: 'Erreur lors de la migration des mots de passe'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Migration des mots de passe</h1>
        <p className="text-gray-600">
          Cette page permet de migrer les mots de passe admin existants vers un format sécurisé.
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-yellow-800">Attention</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Cette opération doit être effectuée une seule fois. Elle va chiffrer tous les mots de passe 
              admin qui sont actuellement stockés en texte brut.
            </p>
          </div>
        </div>
      </div>

      {/* Migration Button */}
      <div className="text-center">
        <Button
          onClick={handleMigration}
          isLoading={loading}
          size="lg"
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Shield className="h-5 w-5 mr-2" />
          {loading ? 'Migration en cours...' : 'Migrer les mots de passe'}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            )}
            <div>
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Migration réussie !' : 'Erreur de migration'}
              </p>
              <p className={`text-sm mt-1 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              {result.success && result.migratedCount !== undefined && (
                <p className="text-sm text-green-700 mt-1">
                  {result.migratedCount} compte(s) admin migré(s).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Cliquez sur le bouton "Migrer les mots de passe" ci-dessus</li>
          <li>Attendez que la migration se termine</li>
          <li>Une fois terminée, vous pourrez vous connecter normalement avec vos identifiants</li>
          <li>Supprimez cette page après utilisation pour des raisons de sécurité</li>
        </ol>
      </div>

      {result?.success && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Migration terminée ! Vous pouvez maintenant vous connecter normalement.
          </p>
          <Button
            onClick={() => window.location.href = '/admin/login'}
            variant="outline"
          >
            Aller à la page de connexion
          </Button>
        </div>
      )}
    </div>
  )
}