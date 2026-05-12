# Étapes 4-5 : Expansion du Normaliseur et Moteur de Contraintes

## Étape 4 : Normalizer Expansion

### Objectif
Étendre le normaliseur pour traiter une gamme complète de phrases vocales et les convertir en nœuds IR canoniques.

### Tâches Principales

#### 4.1 Expansion du registre de phrases initial
Le normaliseur doit reconnaître et normaliser des phrases comme :
- Genre : "modern R&B", "jazz", "classical", "pop", "rock", "hip-hop"
- Rôle : "male lead", "female harmony", "tenor", "soprano", "baritone"
- Surface : "intimate", "breathy", "harsh", "smooth", "raspy"
- Core : "belt-driven", "fragile", "powerful", "delicate"
- Delivery : "conversational", "commanding", "whispering", "belting"
- Motion : "gradual rise", "explosive", "smooth", "staccato"
- Production : "reverb", "compression", "EQ", "delay"

#### 4.2 Gestion des synonymes
Implémenter la reconnaissance de synonymes :
- "intimate" = "close", "personal", "vulnerable"
- "huge" = "powerful", "massive", "belt-driven"
- "fragile" = "delicate", "tender", "soft"
- "conversational" = "spoken", "natural", "relaxed"

#### 4.3 Gestion des phrases composées
Traiter les phrases multi-mots :
- "close-mic'd intimate" → ["close_mic", "intimate"]
- "powerful belt-driven" → ["powerful", "belt_driven"]
- "soft and breathy" → ["soft", "breathy"]

#### 4.4 Mappage émotionnel-technique
Convertir les descriptions émotionnelles en caractéristiques techniques :
- "sad" → ["delivery: melancholic", "motion: slow"]
- "angry" → ["core: powerful", "delivery: commanding"]
- "joyful" → ["motion: energetic", "delivery: bright"]

#### 4.5 Extraction des indices négatifs
Détecter et normaliser les indices négatifs :
- "no falsetto" → hard_rule: no_falsetto
- "not breathy" → hard_rule: no_breathy
- "avoid harsh" → soft_constraint: avoid_harsh

#### 4.6 Extraction des indices de section
Identifier les directives spécifiques à une section :
- "belt in chorus" → sectional: belt_chorus_only
- "intimate verse" → sectional: intimate_verse
- "huge chorus" → sectional: chorus_expansion

#### 4.7 Priorités de phrases d'archétype
Implémenter les priorités pour les phrases connues :
- Phrases haute priorité : "belt-driven", "intimate", "conversational"
- Phrases moyenne priorité : "smooth", "powerful"
- Phrases basse priorité : "with reverb", "compressed"

#### 4.8 Notation de confiance
Ajouter des scores de confiance pour chaque normalisation :
- Correspondance exacte : 1.0
- Correspondance synonyme : 0.9
- Correspondance partielle : 0.7
- Inférence : 0.5

#### 4.9 Indicateurs d'ambiguïté
Marquer les phrases ambiguës qui pourraient avoir plusieurs interprétations :
- "huge" peut être core ou intensité
- "soft" peut être surface ou delivery
- "controlled" peut être robustness ou delivery

#### 4.10 Pondération des phrases
Implémenter la pondération pour les phrases fréquemment utilisées :
- Phrases courantes : poids normal
- Phrases rares : poids réduit
- Phrases clés : poids augmenté

#### 4.11 Règles de déduplication
Éviter les doublons dans la normalisation :
- Si "intimate" et "close" sont détectés, garder seulement "intimate"
- Si "powerful" et "huge" sont détectés, garder seulement "powerful"

## Étape 5 : Conflict Rules and Constraint Engine

### Objectif
Définir les règles de conflit et implémenter le moteur de contraintes pour analyser les violations.

### Tâches Principales

#### 5.1 Consolidation des fichiers de règles de conflit
Organiser les règles de conflit dans une structure centralisée :
- Fichier unique : `src/engine/constraints/conflictRules.ts`
- Définir l'interface `ConflictRule`
- Implémenter la recherche de correspondances

#### 5.2 Définition des relations de conflit supportées
Documenter les types de relations :
- **compatible** : Les nœuds peuvent coexister sans problème
- **tension_productive** : Les nœuds créent une tension créative
- **context_dependent** : La compatibilité dépend du contexte
- **direct_conflict** : Les nœuds sont incompatibles

#### 5.3 Définition des stratégies de résolution supportées
Documenter les stratégies disponibles :
- **allow** : Autoriser les deux nœuds
- **compress** : Compresser/combiner les nœuds
- **prioritize** : Garder le nœud prioritaire, supprimer l'autre
- **refuse** : Refuser les deux nœuds
- **sectionalize** : Placer les nœuds dans des sections différentes

#### 5.4 Règles de conflit : intimate + huge
- Relation : direct_conflict
- Stratégie : prioritize
- Sévérité : strong
- Message : "Intimate and huge are contradictory vocal qualities"

#### 5.5 Règles de conflit : fragile + belt-driven
- Relation : direct_conflict
- Stratégie : prioritize
- Sévérité : strong
- Message : "Fragile and belt-driven are contradictory core qualities"

#### 5.6 Règles de conflit : breathy + commanding
- Relation : direct_conflict
- Stratégie : sectionalize
- Sévérité : warning
- Message : "Breathy and commanding delivery are contradictory"

#### 5.7 Règles de conflit : detached + confessional
- Relation : direct_conflict
- Stratégie : sectionalize
- Sévérité : warning
- Message : "Detached and confessional are contradictory emotional states"

#### 5.8 Règles de conflit : soft + explosive
- Relation : tension_productive
- Stratégie : allow
- Sévérité : info
- Message : "Soft and explosive can create dynamic contrast"

#### 5.9 Règles de conflit : no falsetto + falsetto lift
- Relation : direct_conflict
- Stratégie : refuse
- Sévérité : strong
- Message : "Cannot use falsetto lift when falsetto is forbidden"

#### 5.10 Règles de conflit : no diva + theatrical belt
- Relation : direct_conflict
- Stratégie : refuse
- Sévérité : strong
- Message : "Cannot use theatrical belt when diva quality is forbidden"

#### 5.11 Tests pour les conflits directs
Implémenter des tests pour :
- Détection du conflit intimate + huge
- Détection du conflit fragile + belt-driven
- Détection du conflit breathy + commanding
- Détection du conflit detached + confessional
- Détection du conflit no falsetto + falsetto lift

#### 5.12 Tests pour les tensions productives
Implémenter des tests pour :
- Autorisation du conflit soft + explosive
- Génération d'avertissement pour tension productive
- Trace de la décision

#### 5.13 Tests pour les conflits sectionalisables
Implémenter des tests pour :
- Détection des conflits sectionalisables
- Suggestion de sectionalization
- Trace de la décision

#### 5.14 Tests pour la stratégie de refus
Implémenter des tests pour :
- Refus du conflit no falsetto + falsetto lift
- Refus du conflit no diva + theatrical belt
- Message d'erreur approprié

## État Actuel

### Complété
- ✅ Étapes 0-3 : Consolidation, stabilisation et durcissement
- ✅ 44 tests passants

### À Faire
- ⏳ Étape 4 : Expansion du Normaliseur
- ⏳ Étape 5 : Moteur de Contraintes et Règles de Conflit

## Prochaines Actions

### Étape 4 : Normalizer
1. Créer le registre de phrases initial
2. Implémenter la reconnaissance de synonymes
3. Implémenter la gestion des phrases composées
4. Ajouter le mappage émotionnel-technique
5. Implémenter l'extraction des indices négatifs
6. Ajouter les tests pour chaque fonctionnalité

### Étape 5 : Constraint Engine
1. Consolider les règles de conflit
2. Implémenter la détection de conflits
3. Ajouter les 10 règles de conflit
4. Implémenter les tests pour chaque règle
5. Valider avec les tests existants

## Notes d'Implémentation

- Le normaliseur doit être extensible pour ajouter de nouvelles phrases
- Les règles de conflit doivent être maintenables et documentées
- Tous les tests doivent passer avant de procéder à l'étape suivante
- La couverture de test doit rester > 90%
