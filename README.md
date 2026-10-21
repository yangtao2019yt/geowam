# GeoWAM

Geometry Latent Prediction World Action Model.

Project page: https://yangtao2019yt.github.io/geowam/

This repository contains the static project website and demonstration media. The page presents model architecture, LIBERO/LIBERO-Plus policy results, complete task examples with future depth and motion, paired clean/perturbed recordings, and a sampled future-depth comparison. Paper and model-code links are marked Coming soon.

Evaluation protocols and reference sources are available in the page's expandable evaluation section. Machine-local paths and intermediate cache locations are excluded from this public release; numerical results and source hashes are retained.

## GitHub Pages

Publish the repository's `main` branch, root directory (`/`), in Settings → Pages. `index.html` is the entry point. `.nojekyll` keeps the site static. No backend, Python process, GPU, or model weights are needed to serve the website.

All page assets use relative paths, so the site works under the `/geowam/` project path.
