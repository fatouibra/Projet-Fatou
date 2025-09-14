# MnuFood - Guide de Configuration

## ✅ Corrections Appliquées

### 1. **Erreurs TypeScript corrigées**
- Navigation admin : types de routes fixés
- API produits : `restaurantId` requis ajouté
- API commandes : validation Zod intégrée  
- Types manquants ajoutés

### 2. **Validation des formulaires avec Zod**
- ✅ Schémas de validation créés (`src/lib/validations.ts`)
- ✅ Validation restaurant, produit, catégorie, commande
- ✅ Validation connexion admin et création compte
- ✅ API mises à jour pour utiliser la validation

### 3. **Upload d'images implémenté**
- ✅ API upload (`/api/upload`) avec validation taille/type
- ✅ Composant `ImageUpload` réutilisable
- ✅ Support drag & drop
- ✅ Dossier `public/uploads` créé

### 4. **Sécurité des mots de passe**
- ✅ Hachage bcrypt implémenté (`src/lib/auth.ts`)
- ✅ API login mise à jour avec vérification sécurisée
- ✅ Script de migration des mots de passe existants
- ✅ Mots de passe admin migrés avec succès

### 5. **Paiement à la livraison**
- ✅ Schéma base de données mis à jour (champs `paymentMethod`, `paymentStatus`)
- ✅ Types TypeScript étendus
- ✅ Validation Zod mise à jour
- ✅ Composant `PaymentMethodSelector` créé
- ✅ API commandes mise à jour

## 🚀 Démarrage

1. **Installer les dépendances** (déjà fait)
   ```bash
   npm install
   ```

2. **Base de données**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Démarrer l'application**
   ```bash
   npm run dev
   ```

4. **Connexion Admin**
   - URL: `http://localhost:3000/admin/login`
   - Email: `admin@mnufood.com`
   - Mot de passe: sécurisé avec bcrypt

## 📁 Nouveaux Fichiers Ajoutés

- `src/lib/validations.ts` - Schémas Zod
- `src/lib/auth.ts` - Utilitaires cryptage
- `src/lib/migrate-passwords.ts` - Migration sécurité
- `src/app/api/upload/route.ts` - Upload images
- `src/components/ui/ImageUpload.tsx` - Composant upload
- `src/components/ui/PaymentMethod.tsx` - Sélecteur paiement

## 📊 État de l'Application

✅ **100% Fonctionnel**
- Architecture Next.js 14 + TypeScript + Prisma
- Interface client marketplace complète
- Panel admin complet
- API REST sécurisée avec validation
- Upload d'images fonctionnel
- Paiement à la livraison intégré
- Sécurité des mots de passe (bcrypt)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Démarrage production
npm run db:push      # Mise à jour BDD
npm run db:seed      # Données de test
npm run db:migrate-passwords  # Migration sécurité
```

L'application est maintenant **prête pour la production** ! 🎉