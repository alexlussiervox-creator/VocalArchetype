# Stratégie de Consolidation Progressive - VocalArchetype

## Approche Révisée

Au lieu de rediriger immédiatement vers une nouvelle architecture, nous consolidons d'abord le **code legacy** en place, puis nous créons une migration progressive vers la nouvelle architecture.

## Phase 1 : Consolidation du Code Legacy (Étapes 0-1)

### Objectif
Nettoyer et standardiser l'architecture legacy actuelle sans changer le comportement.

### Étape 1.1 : Archivage des Doublons
Créer des dossiers `_legacy` pour les implémentations anciennes :
```
src/engine/_legacy/
  ├── types/packageTypes.ts (ancien)
  ├── verify/verifier.ts (ancien)
  ├── resolve/compilerAwareResolver.ts (ancien)
  └── rules/conflictRules.ts (ancien)
```

### Étape 1.2 : Standardisation des Chemins Actuels
Garder les chemins actuels comme **chemins canoniques** :
```
src/engine/contracts/packageTypes.ts       ← CANONICAL (types)
src/engine/contracts/capabilityMap.ts      ← CANONICAL (capabilities)
src/engine/verifier/verifier.ts            ← CANONICAL (verify)
src/engine/resolver/compilerAwareResolver.ts ← CANONICAL (resolve)
src/engine/rules/conflictRules.ts          ← CANONICAL (rules)
src/engine/constraintEngine/constraintEngine.ts ← CANONICAL (constraints)
src/engine/packaging/packageSuno.ts        ← CANONICAL (compile)
src/engine/pipeline/runPackagedSunoPipeline.ts ← CANONICAL (pipeline)
```

### Étape 1.3 : Créer des Exports d'Index
Créer des fichiers d'index pour chaque module canonique :
```
src/engine/contracts/index.ts      → ré-exporte packageTypes + capabilityMap
src/engine/verifier/index.ts       → ré-exporte verifier
src/engine/resolver/index.ts       → ré-exporte compilerAwareResolver
src/engine/rules/index.ts          → ré-exporte conflictRules
src/engine/constraintEngine/index.ts → ré-exporte constraintEngine
src/engine/packaging/index.ts      → ré-exporte packageSuno
src/engine/pipeline/index.ts       → ré-exporte runPackagedSunoPipeline
```

### Étape 1.4 : Rediriger les Imports Internes
Mettre à jour les imports internes pour utiliser les chemins d'index :
```
// Avant
import { verifyCompilerIR } from "../verifier/verifier";

// Après
import { verifyCompilerIR } from "../verifier";
```

### Étape 1.5 : Documenter l'Architecture Legacy
Créer une documentation claire de l'architecture actuelle :
- Flux de données
- Responsabilités de chaque module
- Points d'intégration avec l'UI

## Phase 2 : Durcissement du Code Legacy (Étapes 2-3)

### Objectif
Améliorer la qualité et la stabilité du code legacy avant migration.

### Étape 2.1 : Fixer le Test Échouant
- Analyser pourquoi `fallback_prompt` est vide
- Corriger la logique de génération du fallback
- Ajouter des tests supplémentaires

### Étape 2.2 : Améliorer la Couverture de Tests
- Ajouter des tests pour les cas limites
- Tester les interactions entre modules
- Documenter les cas de test

### Étape 2.3 : Valider la Stabilité
- Exécuter tous les tests
- Vérifier la compilation TypeScript
- Tester le build de production

## Phase 3 : Préparation pour la Migration (Étapes 4-5)

### Objectif
Créer une base solide pour la migration vers la nouvelle architecture.

### Étape 3.1 : Créer des Adaptateurs
Créer des couches d'adaptation qui permettront une migration progressive :
```
src/engine/adapters/
  ├── legacyToNew.ts      (convertit legacy IR → new IR)
  ├── newToLegacy.ts      (convertit new IR → legacy IR)
  └── bridgeImplementations.ts (implémentations de pont)
```

### Étape 3.2 : Implémenter les Nouvelles Implémentations
Créer les implémentations de la nouvelle architecture en parallèle :
```
src/engine/new/
  ├── types/packageTypes.ts
  ├── verify/verifier.ts
  ├── resolve/compilerAwareResolver.ts
  ├── constraints/conflictRules.ts
  └── compile/suno/packageSuno.ts
```

### Étape 3.3 : Tests de Compatibilité
Créer des tests qui valident que les deux implémentations produisent les mêmes résultats.

## Phase 4 : Migration Progressive (Étapes 6-9)

### Objectif
Migrer progressivement vers la nouvelle architecture.

### Étape 4.1 : Basculer les Modules un par un
1. Vérificateur
2. Moteur de contraintes
3. Résolveur
4. Compilateur Suno

### Étape 4.2 : Valider à chaque étape
- Tests passent
- Comportement identique
- Performance acceptable

## Phase 5 : Nettoyage Final (Étapes 10-12)

### Objectif
Supprimer l'ancien code et finaliser la migration.

### Étape 5.1 : Archivage
- Créer une branche `legacy-archive`
- Conserver le code ancien pour référence

### Étape 5.2 : Nettoyage
- Supprimer les anciens dossiers
- Mettre à jour la documentation
- Finaliser les tests

## Calendrier d'Exécution

| Phase | Étapes | Priorité | Durée Estimée |
|-------|--------|----------|---------------|
| 1 : Consolidation Legacy | 0-1 | 🔴 Haute | 2-3 heures |
| 2 : Durcissement | 2-3 | 🟡 Moyenne | 2-3 heures |
| 3 : Préparation Migration | 4-5 | 🟡 Moyenne | 3-4 heures |
| 4 : Migration Progressive | 6-9 | 🟢 Basse | 4-6 heures |
| 5 : Nettoyage Final | 10-12 | 🟢 Basse | 1-2 heures |

## Prochaine Action

Commencer par l'**Étape 1.1 : Archivage des Doublons** pour créer une structure claire et maintenable.
