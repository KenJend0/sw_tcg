# Charte Graphique – Application TCG Sci-Fi (inspirée Star Wars)

## 1. Vision & Positionnement

Application mobile-first orientée collection et découverte, inspirée de l’univers sci-fi spatial sans reproduire directement les codes visuels de Star Wars.

Objectifs :
- Accessible à tous les joueurs de TCG
- Identité forte et mémorisable
- Interface claire, non surchargée
- Expérience immersive sans excès visuel

Concept central :  
**Holographic Archive**  
Une interface évoquant une base de données galactique où les cartes sont consultées comme des artefacts projetés.

---

## 2. Direction Artistique

### Style global
- Sci-fi propre et minimaliste
- Mélange ancien / futuriste (archives + hologrammes)
- Ambiance sérieuse mais accessible

### Inspirations visuelles
- Interfaces holographiques
- Bases de données futuristes
- Archives numériques

### Contraintes
- Éviter les clichés néon excessifs
- Éviter les couleurs saturées omniprésentes
- Maintenir une cohérence visuelle forte

---

## 3. Palette de Couleurs

### Couleurs principales

| Usage            | Couleur       | Code HEX |
|------------------|--------------|----------|
| Fond principal   | Nuit profonde | #0D1321 |
| Fond secondaire  | Bleu nuit     | #1D2D44 |
| Texte principal  | Sable clair   | #F0EBD8 |

### Couleurs d’accent

| Usage              | Couleur              | Code HEX |
|--------------------|---------------------|----------|
| Accent principal   | Cyan holographique  | #5BC0EB |
| Accent secondaire  | Orange brûlé        | #F77F00 |
| Accent alternatif  | Violet profond      | #7B2CBF |
| Accent agressif    | Rouge atténué       | #D62828 |

### Règles d’utilisation

- Une seule couleur d’accent dominante par écran
- Utiliser les accents pour guider l’attention
- Éviter de combiner plusieurs accents forts sur un même composant

---

## 4. Typographie

### Titres
- Police : Orbitron ou Rajdhani
- Usage : titres, noms de cartes, éléments importants

### Texte principal
- Police : Inter
- Usage : contenu, descriptions, UI

### Règles typographiques

- Hiérarchie claire (Titre > Sous-titre > Texte)
- Éviter les tailles trop variées
- Maintenir une excellente lisibilité

---

## 5. Composants UI

### 5.1 Cartes

Structure :

- Image (60% hauteur)
- Nom
- Type / Faction
- Description
- Statistiques

Style :

- Fond légèrement texturé
- Bordure fine
- Glow léger (couleur d’accent)
- Ligne horizontale subtile (effet hologramme)

Contraintes :

- Pas de glow excessif
- Lisibilité prioritaire

---

### 5.2 Boutons

Style :

- Fond sombre ou transparent
- Bordure couleur d’accent
- Texte clair

Interactions :

- Hover :
  - léger agrandissement (scale 1.02)
  - apparition d’un glow discret
- Active :
  - réduction légère de la taille

---

### 5.3 Navigation

Structure mobile-first :

Bottom navigation bar avec 4 sections :

- Decks
- Collection
- Play (évolutif)
- Profile

Style :

- Icônes simples (ligne fine)
- Indicateur actif avec couleur d’accent

---

### 5.4 Layout global

- Fond non uniforme (dégradés subtils)
- Espaces respirants
- Hiérarchie visuelle claire

Éléments recommandés :

- Grilles légères
- Zones de contraste
- Effets de profondeur subtils

---

## 6. Effets & Animations

### Signature visuelle

Effet principal : **scan holographique**

Implémentation :

- Lignes horizontales fines
- Légers effets de glow
- Apparitions en fade

### Animations recommandées

- Apparition cartes : fade + léger zoom
- Hover : micro interaction (scale)
- Transitions : fluides et rapides

### Contraintes

- Animations courtes (<300ms)
- Jamais bloquantes
- Toujours fonctionnelles

---

## 7. Expérience Utilisateur (UX)

Principes :

- Simplicité
- Lisibilité immédiate
- Navigation intuitive

Règles :

- Un écran = un objectif
- Informations visibles sans effort
- Réduction du nombre d’actions

Public cible :

- Joueurs TCG casual à intermédiaires
- Utilisateurs mobiles

---

## 8. Structure des Écrans

### Collection

- Grille de cartes
- Navigation rapide
- Mise en avant visuelle des cartes

### Deck Builder

- Liste cartes disponibles
- Zone deck
- Interaction simple (ajout/suppression)

### Carte détail

- Focus sur visuel
- Informations complètes
- Mise en scène immersive

---

## 9. Contraintes Techniques (Web / Vercel)

- Design mobile-first
- Compatible responsive
- Optimisé performance

Recommandations :

- Tailwind CSS pour rapidité
- Composants réutilisables
- Gestion des thèmes (couleurs dynamiques)

---

## 10. Principes Directeurs

- Cohérence visuelle stricte
- Priorité à la lisibilité
- Identité unique avant esthétique pure
- Simplicité avant complexité