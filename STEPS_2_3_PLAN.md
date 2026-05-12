# Étapes 2-3 : Stabilisation de l'IR Canonique et Durcissement du Vérificateur

## Étape 2 : Canonical IR Stabilization

### Objectif
Verrouiller la structure `CompilerIR` et documenter tous les domaines sémantiques valides.

### Tâches

#### 2.1 Verrouiller la forme canonique de CompilerIR
- Confirmer la structure actuelle dans `src/engine/contracts/packageTypes.ts`
- Documenter chaque champ et son rôle
- Ajouter des commentaires pour chaque propriété

#### 2.2 Confirmer toutes les classes sémantiques
Les classes sémantiques valides sont :
- `trait` - Caractéristique vocale fondamentale
- `preference` - Préférence de rendu
- `hard_rule` - Règle stricte non négociable
- `soft_constraint` - Contrainte flexible
- `render_hint` - Indice pour le rendu
- `multi_voice` - Configuration multi-voix

#### 2.3 Définir tous les domaines sémantiques valides
Les domaines actuels sont :
- `genre` - Genre musical
- `role` - Rôle vocal
- `surface` - Texture vocale
- `core` - Essence vocale
- `delivery` - Manière de livrer
- `motion` - Dynamique vocale
- `production` - Éléments de production
- `sectional` - Directives sectionnelles
- `multiVoice` - Configuration multi-voix

#### 2.4 Définir tous les noms de section valides
Les sections valides sont :
- `global` - Directives globales
- `intro` - Introduction
- `verse` - Couplet
- `preChorus` - Pré-refrain
- `chorus` - Refrain
- `bridge` - Pont
- `outro` - Outro
- `custom` - Section personnalisée

#### 2.5 Définir la structure des atomes
Chaque `IRNode` doit avoir :
- `id` - Identifiant unique
- `canonicalKey` - Clé canonique pour les recherches
- `semanticClass` - Classe sémantique
- `domain` - Domaine sémantique
- `text` - Texte du nœud
- `priority` - Priorité (dominant, blended, subtle)
- `intensity` - Intensité (0-100)
- `robustness` - Robustesse (low, medium, high)
- `support` - Niveau de support (direct, approximate, unsupported, rejected)
- `target?` - Cible optionnelle (section)
- `tags?` - Tags optionnels
- `source?` - Source optionnelle

#### 2.6 Définir les échelles de priorité, intensité et robustesse
- **Priority** : dominant > blended > subtle
- **Intensity** : 0-100 (numérique)
- **Robustness** : low < medium < high

#### 2.7 Définir les niveaux de support
- **direct** - Directement supporté
- **approximate** - Approximativement supporté
- **unsupported** - Non supporté
- **rejected** - Rejeté

#### 2.8 Définir la structure de la trace de compilation
La trace doit enregistrer :
- `step` - Étape du pipeline
- `code` - Code d'erreur/avertissement
- `message` - Message lisible
- `nodeIds?` - IDs des nœuds affectés
- `severity?` - Sévérité (info, warning, strong)

#### 2.9 Définir la structure d'avertissement
Les avertissements doivent contenir :
- `code` - Code d'avertissement
- `message` - Message lisible
- `severity` - Sévérité (info, warning, strong)
- `nodeIds?` - IDs des nœuds affectés

#### 2.10 Définir le contrat de sortie de packaging
Le `SunoPackage` doit contenir :
- `strict_prompt` - Prompt strict
- `compressed_prompt` - Prompt compressé
- `fallback_prompt` - Prompt de secours
- `sectioned_prompt_payload` - Payload sectionnée
- `compile_summary` - Résumé de compilation
- `warnings` - Avertissements
- `compileTrace` - Trace de compilation

#### 2.11 Ajouter des commentaires documentant les couches
Documenter dans le fichier de types :
- Quelle couche possède quel sens
- Quels champs sont mutuellement exclusifs
- Quels champs sont obligatoires vs optionnels

#### 2.12 Empêcher l'UI d'inventer de nouveaux champs sémantiques
Documenter que seuls les domaines et classes définis sont valides.

## Étape 3 : Verifier Hardening

### Objectif
Améliorer la robustesse du vérificateur et augmenter la couverture de tests.

### Tâches

#### 3.1 Vérifier tous les champs d'atome
Le vérificateur doit valider :
- `id` - Non vide
- `canonicalKey` - Non vide
- `semanticClass` - Valeur valide
- `domain` - Valeur valide
- `text` - Non vide
- `priority` - Valeur valide
- `intensity` - Dans la plage 0-100
- `robustness` - Valeur valide
- `support` - Valeur valide

#### 3.2 Vérifier les plages de priorité/intensité/robustesse
- Priority : dominant | blended | subtle
- Intensity : 0-100
- Robustness : low | medium | high

#### 3.3 Vérifier la validité des patchs de section
- Section doit être valide
- Les directives doivent être non vides
- Les clés supprimées doivent exister

#### 3.4 Vérifier que les hard rules n'apparaissent que dans la couche hard-rule
- Erreur si un hard rule apparaît ailleurs

#### 3.5 Vérifier que les soft constraints n'apparaissent que dans la couche soft-constraint
- Erreur si une soft constraint apparaît ailleurs

#### 3.6 Vérifier que les render hints ne sont pas des traits
- Erreur si un render hint est marqué comme trait

#### 3.7 Vérifier que les structures multi-voix sont valides
- Vérifier le pattern
- Vérifier les rôles
- Vérifier les sections assignées

#### 3.8 Vérifier que le style budget est valide
- Tous les domaines de style présents
- Valeurs numériques valides

#### 3.9 Vérifier que le backend cible est supporté
- Actuellement : suno

#### 3.10 Ajouter des tests pour les IR invalides
- Test : ID manquant
- Test : canonicalKey manquant
- Test : semanticClass invalide
- Test : domain invalide
- Test : text manquant
- Test : priority invalide
- Test : intensity hors plage
- Test : robustness invalide
- Test : support invalide

#### 3.11 Ajouter des tests pour les IR valides
- Test : IR minimal valide
- Test : IR complet valide
- Test : IR avec sections valides
- Test : IR avec multi-voix valide

#### 3.12 Ajouter des tests pour les patchs de section malformés
- Test : section invalide
- Test : directives vides
- Test : clés supprimées invalides

#### 3.13 Ajouter des tests pour les atomes dupliqués
- Test : détection des clés canoniques dupliquées
- Test : détection des IDs dupliqués

## État Actuel

### Complété
- ✅ Étape 0 : Récupération et baseline
- ✅ Étape 1 : Consolidation du dépôt
- ✅ Bug du fallback prompt corrigé

### À Faire
- ⏳ Étape 2 : Stabilisation de l'IR Canonique
- ⏳ Étape 3 : Durcissement du Vérificateur

## Prochaines Actions

1. Documenter la structure `CompilerIR` avec tous les détails
2. Ajouter des commentaires au fichier de types
3. Améliorer le vérificateur avec plus de validations
4. Ajouter des tests pour tous les cas d'erreur
5. Valider avec les tests existants
