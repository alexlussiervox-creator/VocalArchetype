# Analyse : Test Échouant - Fallback Prompt

## Test Concerné

**Fichier** : `tests/packaging/packageSuno.test.ts`
**Test** : `packageSuno > produces fallback when support is weaker or trimmed`
**Erreur** : `expected 0 to be greater than 0`

```typescript
const resolved = resolveCompilerIR(runConstraintEngine(exampleIRs.weakSupportExample));
const result = packageSuno(resolved);
expect(result.fallback_prompt.length).toBeGreaterThan(0);
```

## Problème

Le `fallback_prompt` est généré vide (`length === 0`) alors qu'il devrait contenir du contenu lorsque le support est faible ou que des nœuds ont été supprimés.

## Contexte

Le fallback prompt est censé être une version simplifiée du prompt strict, utilisée quand :
1. Le support des traits est faible ou approximatif
2. Des nœuds ont été supprimés pendant la résolution
3. La qualité du prompt strict est compromise

## Analyse de la Chaîne de Compilation

### 1. Fixture d'Exemple
Le test utilise `exampleIRs.weakSupportExample`. Nous devons vérifier :
- Quels nœuds sont dans cet exemple
- Quel est leur niveau de support
- Quel est le résultat attendu après résolution

### 2. Étape de Résolution
`resolveCompilerIR()` devrait :
- Analyser les contraintes
- Identifier les nœuds avec support faible
- Marquer les nœuds pour suppression ou déplacement
- Générer des avertissements

### 3. Étape de Packaging
`packageSuno()` devrait :
- Générer le `strict_prompt` à partir des nœuds globaux
- Générer le `fallback_prompt` à partir des nœuds supprimés ou approximés
- Utiliser `compressPrompt()` pour réduire la taille si nécessaire

## Hypothèses Possibles

1. **Aucun nœud n'est marqué pour suppression** : La résolution ne supprime pas les nœuds
2. **Le fallback n'est pas généré** : La logique de génération du fallback est manquante
3. **La fixture est incorrecte** : L'exemple ne contient pas de nœuds avec support faible
4. **La condition est incorrecte** : Le test vérifie la mauvaise condition

## Prochaines Étapes

1. Examiner la fixture `weakSupportExample`
2. Tracer l'exécution à travers la résolution
3. Vérifier la logique de génération du fallback
4. Corriger le bug ou le test selon les résultats
