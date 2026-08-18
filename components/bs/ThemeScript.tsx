/**
 * Sets the ink (light/dark) attribute before first paint so the
 * paper never flashes white on a dark-mode load.
 */
export default function ThemeScript() {
  const js = `(function(){try{var s=localStorage.getItem("bs-ink");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.setAttribute("data-ink","dark");}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
