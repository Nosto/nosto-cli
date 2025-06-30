export function getLoaderScript(): Uint8Array {
  return new TextEncoder().encode(
    `
        (function() {
            if (window.nostoTemplatesLoaded) {
                return;
            };
            window.nostoTemplatesLoaded = true;

            var u = window.nostoTemplatesFileResolver || function(v) {
                return new URL(v, document.currentScript.src).toString();
            };

            var j = document.createElement('script');
            j.type = 'text/javascript';
            j.src = window.nostoTemplatesFileResolver('bundle.js');
            document.body.appendChild(j);

            var c = document.createElement('link');
            c.rel = 'stylesheet';
            c.type = 'text/css';
            c.media = 'all';
            c.href = window.nostoTemplatesFileResolver('bundle.css');
            document.head.appendChild(c);
        })();
    `.replace(/\s+/g, " ")
  )
}
