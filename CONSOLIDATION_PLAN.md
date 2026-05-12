# Plan de Consolidation VocalArchetype

## État Actuel (Audit Complet)

### Pipeline Actif (Legacy)
Le pipeline en production utilise actuellement l'architecture legacy :

```
compileFromSelections (src/app/adapters/)
  ↓
runPackagedSunoPipeline (src/engine/pipeline/)
  ├─ verifyCompilerIR (src/engine/verifier/)
  ├─ runConstraintEngine (src/engine/constraintEngine/)
  ├─ resolveCompilerIR (src/engine/resolver/)
  └─ packageSuno (src/engine/packaging/)
```

**Types utilisés** : `src/engine/contracts/packageTypes.ts`
**Capabilités** : `src/engine/contracts/capabilityMap.ts`

### Architecture Nouvelle (Partiellement Implémentée)
Une nouvelle architecture existe mais n'est pas connectée :

```
src/engine/types/packageTypes.ts (types layered)
src/engine/verify/verifier.ts (nouveau vérificateur)
src/engine/resolve/compilerAwareResolver.ts (nouveau résolveur)
src/engine/constraints/conflictRules.ts (nouvelles règles)
src/engine/compile/suno/packageSuno.ts (nouveau packaging)
```

### État du Build
- ✅ TypeScript compile sans erreurs
- ✅ Vite build réussit
- ⚠️ 1 test échoue : `packageSuno > produces fallback when support is weaker or trimmed`
- ✅ 20 tests passent

## Stratégie de Consolidation

### Approche : Migration Progressive avec Dépôt Dual

Au lieu de supprimer immédiatement, nous allons :

1. **Créer une couche d'abstraction** pour isoler les chemins
2. **Migrer par étapes** en maintenant la compatibilité
3. **Valider à chaque étape** avec les tests existants
4. **Nettoyer progressivement** les anciens chemins

### Étape 1 : Créer des Exports Canoniques

Créer des fichiers d'index dans les dossiers canoniques qui ré-exportent les implémentations actuelles :

```
src/engine/types/index.ts         → ré-exporte contracts/packageTypes
src/engine/verify/index.ts        → ré-exporte verifier/verifier
src/engine/resolve/index.ts       → ré-exporte resolver/compilerAwareResolver
src/engine/constraints/index.ts   → ré-exporte rules/conflictRules + constraintEngine
src/engine/compile/suno/index.ts  → ré-exporte packaging/packageSuno
```

### Étape 2 : Rediriger les Imports

Mettre à jour les imports dans :
- `src/engine/pipeline/runPackagedSunoPipeline.ts`
- `src/app/adapters/compileFromSelections.ts`
- `src/app/selectors/derivedCompilerState.ts`
- Tous les fichiers de test

### Étape 3 : Consolider les Types

Fusionner les deux définitions de `packageTypes.ts` :
- Garder les types legacy pour compatibilité immédiate
- Ajouter les types nouveaux comme extensions
- Créer des adaptateurs de conversion si nécessaire

### Étape 4 : Migrer les Implémentations

Déplacer progressivement le code réel vers les chemins canoniques :
- Copier `verifier/verifier.ts` → `verify/verifier.ts` (garder l'ancien temporairement)
- Copier `resolver/compilerAwareResolver.ts` → `resolve/compilerAwareResolver.ts`
- Copier `packaging/packageSuno.ts` → `compile/suno/packageSuno.ts`
- Copier `rules/conflictRules.ts` → `constraints/conflictRules.ts`

### Étape 5 : Nettoyer les Doublons

Une fois tous les imports redirigés et les tests passants :
- Archiver les anciens dossiers : `src/engine/verifier/`, `src/engine/resolver/`, etc.
- Supprimer les fichiers dupliqués
- Valider le build final

## Ordre d'Exécution

### Phase 1 : Préparation (Étapes 0-1 du Checklist)
1. ✅ Cloner le dépôt
2. ✅ Audit initial
3. ⏳ Créer les exports canoniques
4. ⏳ Rediriger les imports du pipeline
5. ⏳ Rediriger les imports de l'app
6. ⏳ Valider les tests

### Phase 2 : Consolidation des Types (Étape 2 du Checklist)
1. ⏳ Analyser les différences entre les deux `packageTypes.ts`
2. ⏳ Créer une version unifiée
3. ⏳ Mettre à jour les imports
4. ⏳ Valider la compilation

### Phase 3 : Stabilisation de l'IR (Étape 2 du Checklist)
1. ⏳ Verrouiller la structure `CompilerIR`
2. ⏳ Documenter tous les domaines sémantiques
3. ⏳ Ajouter les validations manquantes
4. ⏳ Créer les tests de vérification

### Phase 4+ : Étapes Suivantes
Continuer avec les étapes 3-12 du checklist selon le plan établi.

## Fichiers Clés à Modifier

### Exports Canoniques à Créer
```
src/engine/types/index.ts
src/engine/verify/index.ts
src/engine/resolve/index.ts
src/engine/constraints/index.ts
src/engine/compile/suno/index.ts
```

### Imports à Rediriger
```
src/engine/pipeline/runPackagedSunoPipeline.ts
src/app/adapters/compileFromSelections.ts
src/app/selectors/derivedCompilerState.ts
tests/packaging/packageSuno.test.ts
tests/pipeline/runPackagedSunoPipeline.test.ts
tests/resolver/compilerAwareResolver.test.ts
tests/verifier/verifier.test.ts
```

## Risques et Mitigations

| Risque | Mitigation |
|--------|-----------|
| Casser le build existant | Valider à chaque étape, garder les anciens chemins temporairement |
| Tests échouent | Exécuter les tests après chaque modification |
| Imports circulaires | Utiliser des fichiers d'index pour isoler les chemins |
| Perte de code | Archiver au lieu de supprimer, utiliser git pour tracer |

## Prochaine Action

Commencer par l'Étape 1 : Créer les fichiers d'index canoniques et rediriger les imports du pipeline.
