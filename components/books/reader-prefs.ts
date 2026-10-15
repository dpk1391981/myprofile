/**
 * Shared by the server-rendered chapter page and the client ReaderControls.
 * A plain module on purpose: a string exported from a "use client" file reaches
 * a server component as a client reference, not as the string.
 */
export const READER_KEY = "books.reader";
export const READER_SIZES = 5;   // data-size 0..4; 2 is the default

/** Applies the saved reader settings to #bk-desk before first paint. Runs
 *  inline, so it stays tiny and cannot throw. */
export const READER_INIT_SCRIPT =
  `try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(READER_KEY)})||"{}"),` +
  `d=document.getElementById("bk-desk");if(d){if(p.size>=0&&p.size<${READER_SIZES})d.dataset.size=p.size;` +
  `if(p.paper)d.dataset.paper=p.paper}}catch(e){}`;
