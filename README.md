# "Objects in Space"
**CS3210 // Computer Graphics - Project 2**

@authors Gaby Zola, Seth Holtzman, Justin Featherstone

# Known issues 
If you have trouble with controls not being a valid import or not being found consider uninstall three and vite then reinstalling 

```bash
npm uninstall three
npm uninstall vite

npm install three
npm install vite
```

# Quick Start 

1. Install the required libraries
```bash
npm i three
npm i vite
npm i vite-plugin-glsl
```

2. Run and enjoy! 
```
npx vite 
```
File Structure Initial Concept:
```css
project-root/
│
├── src/
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   ├── shaders/
│   │   ├── vertexShader.glsl
│   │   └── fragmentShader.glsl
│   ├── scripts/
│   │   ├── controls/
│   │   │   └── MouseControls.js
│   │   ├── objects/
│   │   │   ├── Plane.js
│   │   │   └── MovingObject.js
│   │   └── utils/
│   │       └── CollisionDetector.js
│   └── assets/
│       └── textures/
├── package.json
└── README.md
```
