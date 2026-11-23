import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync,constants} from 'node:zlib';
import {haCardBuild} from './ha-card-build.mjs';
// Built straight into the integration, which serves the card on every dashboard.
const card='../custom_components/hestia_heating/frontend/hestia-heating-card.js';
await build({entryPoints:['src/card.ts'],bundle:true,...haCardBuild,target:'es2022',minify:true,outfile:card,legalComments:'none',loader:{'.css':'text'}});
// Its compressed copy beside it, written at each build so that it never lags behind the card.
writeFileSync(card+'.gz',gzipSync(readFileSync(card),{level:constants.Z_BEST_COMPRESSION}));
