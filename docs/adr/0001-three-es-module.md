# Load Three.js as a local ES module, not UMD `three.min.js`

The competition pack asks for `/vendor/three.min.js`, but current Three.js (r169) no longer ships a UMD build. Using a CDN is forbidden. This prototype copies `three.module.min.js` from the sibling Housecats greybox and loads it with an import map so the game stays fully offline.
