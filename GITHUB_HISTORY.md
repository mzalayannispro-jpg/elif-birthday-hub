# 📜 Historique GitHub & Changelog Exhaustif (Elif Multiverse)

*Ce document compile non seulement les commits, mais aussi les raisonnements conversationnels et techniques ayant mené à ces décisions (spécifiquement formaté pour NotebookLM et les LLM d'analyse).*

---

## 🛠️ MAI 2026 : LA CRISE PHYSIQUE ET LA RENAISSANCE (Layer 2)

**03 Mai 2026 : Le "Super Elif Death Bug" & Restructuration**
- `bb604aa` **docs: extensive updates to all tracking and architecture documentation**
  - *Contexte :* Demande explicite de l'utilisateur de fournir "un maximum de détails et d'historique conversationnel" pour ingest dans NotebookLM. Création d'explications mathématiques des bugs (Tunneling, Pathfinding).
- `407c029` **fix: resolve tunneling and spawn collision in mario**
  - *Le Tunneling (Physique) :* `MAXDY` était de `METER * 60`. En 1/60ème de seconde, l'objet parcourait la taille entière d'une tuile (50px). Les collisions AABB calculant `cell_curr` (position actuelle) vs `cell_down` (position future) échouaient silencieusement. Le joueur tombait à travers le vide. `MAXDY` est réduit à `METER * 30`.
  - *Le Spawn Collision :* Les générateurs aléatoires plaçaient les monstres à `x=5`. Leurs vitesses de déplacement croisaient exactement la trajectoire verticale du joueur au moment de l'atterrissage. Correctif : Génération repoussée à `x=10`.
- `5ea6660` **fix: set fixed height 80vh for layer 2 game containers**
  - Le canvas de Mario s'écrasait en une bande horizontale de quelques pixels. L'explication : `height: 100%` dans un parent absolu sans hauteur donne `0px`. Remplacé par un durcissement CSS : `height: 80vh; min-height: 500px;`.
- `78d0f2f` **fix: adjust mario camera scaling and death bounds**
  - Indépendamment du problème CSS, le calcul de la "Kill Zone" (Zone de mort) était fixé par la hauteur physique de la fenêtre du navigateur (`height + TILE`). Il a été corrigé pour utiliser la matrice réelle du monde `mapHeight * TILE`. Ajout d'un système de zoom natif `ctx.scale()` pour lier la résolution logique à la résolution physique.

**02-03 Mai 2026 : L'Avènement des Moteurs Open Source**
- `ffafa9d` **feat: complete rewrite of layer 2 games using open source engines**
  - *Discussion & Choix :* Devant l'instabilité de la gravité artisanale des premiers prototypes, décision de migrer vers des standards de l'industrie.
  - Intégration de `matter.min.js` via CDN Cloudflare pour Angry Stickers. Création des `Constraint` (ressorts élastiques) et `Composite`.
  - Intégration de Tiny Platformer pour Mario (gestion par array matriciel 1D pour l'indexation de la carte 2D).
- `607fbcb` **fix: layer 2 games appearing empty (cache busting and display flex)**
  - Les Canvas étaient masqués à cause d'un conflit de style entre le `display: none` global de `active-game-area` et l'injection dynamique.

**Début Mai 2026 : Sauvegarde & Qualité de Vie (QoL)**
- `2c223c3` **Add error boundaries to showGame** : Captation des `try/catch` pour identifier l'origine des Canvas défaillants.
- `4d30241` **Add button to reopen personal message modal** : Le `sessionStorage` masquait le message d'amour de l'intro. Un bouton "💌 Message" en haut à droite offre la fonctionnalité Replay sans recharger la page.
- `7e28f41` **Fix UI navigation state and modal reappearing** : Problème d'état du navigateur (`history.back`) après avoir visité la vidéo de l'Easter Egg (Cadeau 1). Résolu en forçant l'ouverture dans un `target="_blank"`.

---

## 🚀 AVRIL 2026 : FONDATION DU HUB (Layer 1)

**25-27 Avril 2026 : L'Expérience Personnalisée Ultime**
- `39602a7` **feat: Add Magic Door, Save Code system, and Spotify integration**
  - Construction du pont entre le Web Statique et la Persistance. L'algorithme `ELIF-Score-Hash` est né. La porte magique (Cadeau de 6000 pts) est injectée via manipulation DOM.
- `8472d24` **feat(i18n): update modal text with personal letter and sticker**
  - Création du dictionnaire `assets/i18n.js` gérant les balises `data-i18n` sur tout le DOM.
- `bdadb2c` **fix(sudoku): remove all auto-generated French quotes**
  - Injection de "Inside Jokes" bruts à la place du code générique.
- `5840563` **fix(assets): rewrite update_stickers.js**
  - La pièce maîtresse de l'intégration : Un algorithme Node.js (`fs.readdirSync` récursif) qui compile l'arborescence des images en un JSON natif, permettant d'ajouter infiniment de stickers dans le dossier `/assets` sans toucher à `app.js`.

**19-22 Avril 2026 : Le Sprint Initial & Esthétique Kitsch**
- `2ce92f4` **perf: collage - 190 static imgs hardcoded, no GIFs**
  - *Crise de Performance :* L'animation des GIFs en fond d'écran causait un effondrement des FPS sur Safari iOS. Le script de Collage a été forcé de n'inclure que des PNG/WebP statiques. L'insertion dans le DOM a été refactorisée pour utiliser un `DocumentFragment`, évitant 200 "reflows" du navigateur à l'ouverture.
- `1bfba78` **fix: sudoku click-select, mahjong height, tablet touch controls**
  - Adaptation primordiale pour l'iPad. Le `onclick` ne suffisant pas sur iOS, les contrôles tactiles (`touchstart`) ont été intégrés aux d-pads et aux grilles.
- `489d637` **feat: uzinagaz - human body in tiger speedo**
  - Définition de l'esthétique décalée. L'algorithme de balancier utilise une fonction sinusoïdale modifiée pour créer le rebond asymétrique de la cible.
- `c84cf07` **🌙 Initial commit - Elif Birthday Hub**
  - Création du dépôt, du `style.css` fondamental (les Tapis Persans, la couleur `var(--gold)` et `var(--dark-brown)`). Le projet "Anniversaire Copine" commence.
