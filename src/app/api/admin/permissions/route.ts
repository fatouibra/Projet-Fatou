import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Si aucune permission n'existe, créer les permissions par défaut
    const existingPermissions = await db.permission.findMany()
    
    if (existingPermissions.length === 0) {
      // Créer les permissions par défaut
      const defaultPermissions = [
        // Dashboard
        { name: 'Voir dashboard', description: 'Accéder au tableau de bord principal', category: 'dashboard' },
        { name: 'Voir statistiques', description: 'Consulter les statistiques détaillées', category: 'dashboard' },
        
        // Restaurants
        { name: 'Voir restaurants', description: 'Lister tous les restaurants', category: 'restaurants' },
        { name: 'Créer restaurants', description: 'Ajouter de nouveaux restaurants', category: 'restaurants' },
        { name: 'Modifier restaurants', description: 'Éditer les informations des restaurants', category: 'restaurants' },
        { name: 'Supprimer restaurants', description: 'Supprimer des restaurants', category: 'restaurants' },
        
        // Produits
        { name: 'Voir produits', description: 'Lister tous les produits', category: 'products' },
        { name: 'Créer produits', description: 'Ajouter de nouveaux produits', category: 'products' },
        { name: 'Modifier produits', description: 'Éditer les produits existants', category: 'products' },
        { name: 'Supprimer produits', description: 'Supprimer des produits', category: 'products' },
        
        // Commandes
        { name: 'Voir commandes', description: 'Consulter toutes les commandes', category: 'orders' },
        { name: 'Modifier commandes', description: 'Modifier le statut des commandes', category: 'orders' },
        { name: 'Supprimer commandes', description: 'Annuler ou supprimer des commandes', category: 'orders' },
        
        // Utilisateurs
        { name: 'Voir utilisateurs', description: 'Lister tous les utilisateurs', category: 'users' },
        { name: 'Modifier utilisateurs', description: 'Éditer les profils utilisateurs', category: 'users' },
        { name: 'Bannir utilisateurs', description: 'Suspendre des comptes utilisateurs', category: 'users' },
        
        // Gestionnaires
        { name: 'Voir gestionnaires', description: 'Lister tous les gestionnaires', category: 'managers' },
        { name: 'Créer gestionnaires', description: 'Ajouter de nouveaux gestionnaires', category: 'managers' },
        { name: 'Modifier gestionnaires', description: 'Éditer les profils gestionnaires', category: 'managers' },
        { name: 'Supprimer gestionnaires', description: 'Supprimer des comptes gestionnaires', category: 'managers' },
        
        // Promotions
        { name: 'Voir promotions', description: 'Consulter toutes les promotions', category: 'promotions' },
        { name: 'Créer promotions', description: 'Créer de nouvelles promotions', category: 'promotions' },
        { name: 'Modifier promotions', description: 'Éditer les promotions existantes', category: 'promotions' },
        { name: 'Supprimer promotions', description: 'Supprimer des promotions', category: 'promotions' },
        
        // Finances
        { name: 'Voir finances', description: 'Accéder aux données financières', category: 'finances' },
        { name: 'Exporter finances', description: 'Télécharger les rapports financiers', category: 'finances' },
        
        // Paramètres
        { name: 'Voir paramètres', description: 'Consulter les paramètres système', category: 'settings' },
        { name: 'Modifier paramètres', description: 'Modifier la configuration système', category: 'settings' },
        
        // Rôles
        { name: 'Voir rôles', description: 'Consulter tous les rôles', category: 'roles' },
        { name: 'Créer rôles', description: 'Créer de nouveaux rôles', category: 'roles' },
        { name: 'Modifier rôles', description: 'Éditer les rôles existants', category: 'roles' },
        { name: 'Supprimer rôles', description: 'Supprimer des rôles', category: 'roles' },
      ]

      await db.permission.createMany({
        data: defaultPermissions
      })
    }

    const permissions = await db.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      permissions
    })

  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des permissions' },
      { status: 500 }
    )
  }
}