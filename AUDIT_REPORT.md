# VocalArchetype - Rapport d'Audit de Consolidation

## Structure Actuelle du Moteur

### Duplications Identifiées

| Ancien Chemin | Nouveau Chemin | Statut |
|---|---|---|
| `src/engine/contracts/` | `src/engine/types/` | Duplication détectée |
| `src/engine/verifier/` | `src/engine/verify/` | Duplication détectée |
| `src/engine/resolver/` | `src/engine/resolve/` | Duplication détectée |
| `src/engine/rules/` | `src/engine/constraints/` | Duplication détectée |
| `src/engine/packaging/` | `src/engine/compile/suno/` | Duplication partielle |

### Fichiers Identifiés

#### Couche de Types
- `src/engine/contracts/packageTypes.ts` (ancien)
- `src/engine/types/packageTypes.ts` (nouveau)
- `src/engine/contracts/capabilityMap.ts` (ancien)

#### Couche de Vérification
- `src/engine/verifier/verifier.ts` (ancien)
- `src/engine/verify/verifier.ts` (nouveau)

#### Couche de Résolution
- `src/engine/resolver/compilerAwareResolver.ts` (ancien)
- `src/engine/resolve/compilerAwareResolver.ts` (nouveau)

#### Couche de Contraintes
- `src/engine/rules/conflictRules.ts` (ancien)
- `src/engine/constraints/conflictRules.ts` (nouveau)

#### Couche de Compilation Suno
- `src/engine/packaging/packageSuno.ts` (ancien)
- `src/engine/packaging/compressPrompt.ts` (ancien)
- `src/engine/compile/suno/packageSuno.ts` (nouveau)

#### Couche de Pipeline
- `src/engine/pipeline/runPackagedSunoPipeline.ts` (point d'entrée principal)

#### Couche de Normalisation
- `src/engine/normalize/normalizer.ts`
- `src/engine/normalize/registry.ts`

#### Couche de Contraintes Moteur
- `src/engine/constraintEngine/constraintEngine.ts`

#### Fixtures et Tests
- `src/engine/fixtures/exampleIRs.ts`
- `src/engine/fixtures/exampleRequests.ts`
- `src/engine/tests/normalizer.test.ts`
- `tests/packaging/packageSuno.test.ts`
- `tests/pipeline/runPackagedSunoPipeline.test.ts`
- `tests/resolver/compilerAwareResolver.test.ts`
- `tests/verifier/verifier.test.ts`

### Structure de l'Application
- `src/app/adapters/compileFromSelections.ts` - Adaptateur UI vers compilateur
- `src/app/selectors/derivedCompilerState.ts` - Sélecteurs d'état dérivé
- `src/app/state/editableState.ts` - État éditable UI
- `src/app/components/InstallAppButton.tsx` - Composant PWA
- `src/app/pwa/useInstallPrompt.ts` - Hook PWA

## Plan de Consolidation

### Phase 1 : Audit Complet
1. Examiner chaque fichier dupliqué
2. Identifier le code actif vs legacy
3. Mapper les dépendances croisées
4. Documenter les différences

### Phase 2 : Standardisation des Chemins
Chemins canoniques à utiliser :
- `src/engine/types/` - Tous les contrats et types
- `src/engine/verify/` - Vérificateur
- `src/engine/resolve/` - Résolveur
- `src/engine/constraints/` - Règles de conflit et moteur
- `src/engine/compile/suno/` - Compilateur Suno
- `src/engine/normalize/` - Normaliseur
- `src/engine/pipeline/` - Pipeline principal

### Phase 3 : Migration des Imports
1. Mettre à jour tous les imports vers les chemins canoniques
2. Vérifier la compilation TypeScript
3. Exécuter les tests

### Phase 4 : Nettoyage
1. Archiver les dossiers legacy
2. Supprimer les fichiers dupliqués
3. Valider la stabilité du build

## Prochaines Étapes
1. Lire les fichiers dupliqués pour identifier le code actif
2. Créer un script de migration des imports
3. Exécuter les migrations par étapes
4. Valider avec les tests existants
