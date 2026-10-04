import {
  ICON_OPTIONS,
  normalizeIconKey,
  resolvePageIcon,
  ICON_MAP,
} from "../src/lib/pageIcons";
import { getCatalogIcon, pascalToKebab } from "../src/lib/lucideCatalog";

let fails = 0;
const check = (label: string, cond: boolean, extra?: unknown) => {
  if (!cond) {
    fails++;
    console.log("FAIL:", label, extra ?? "");
  } else {
    console.log("ok  :", label);
  }
};

console.log("catalogo icone totali:", ICON_OPTIONS.length);
check("catalogo > 1500", ICON_OPTIONS.length > 1500, ICON_OPTIONS.length);

// kebab conversion
check("pascalToKebab FileText", pascalToKebab("FileText") === "file-text");
check("pascalToKebab AArrowDown", pascalToKebab("AArrowDown") === "a-arrow-down");
check(
  "pascalToKebab ALargeSmall",
  pascalToKebab("ALargeSmall") === "a-large-small",
  pascalToKebab("ALargeSmall"),
);

// normalizeIconKey (formati storici)
check('normalize "FileText" -> file-text', normalizeIconKey("FileText") === "file-text");
check('normalize "file-text"', normalizeIconKey("file-text") === "file-text");
check('normalize "fileText"', normalizeIconKey("fileText") === "file-text");
check("normalize emoji preserva", normalizeIconKey("\uD83D\uDD25") === "\uD83D\uDD25");
check("normalize \"\" -> undefined", normalizeIconKey("") === undefined);
check("normalize sconosciuto -> undefined", normalizeIconKey("zzz-not-an-icon") === undefined);

// resolvePageIcon: PascalCase salvato in passato ora si risolve
const iconFromPascal = resolvePageIcon({ type: "tasks", icon: "FileText" });
check("resolvePageIcon FileText != fallback ListTodo", iconFromPascal !== resolvePageIcon({ type: "tasks" }));

// Esempi icona "nuova" dal catalogo completo (prima non era in ICON_MAP)
const cupSoda = getCatalogIcon("cup-soda");
check("getCatalogIcon cup-soda", !!cupSoda);
check("normalize cup-soda", normalizeIconKey("CupSoda") === "cup-soda", normalizeIconKey("CupSoda"));
const fromKebab = resolvePageIcon({ type: "empty", icon: "cup-soda" });
check("resolvePageIcon cup-soda != FileText", fromKebab !== resolvePageIcon({ type: "empty" }));

// Nessuna icona -> fallback per tipo
check(
  "icona vuota -> fallback tipo",
  resolvePageIcon({ type: "notes", icon: "" }) === resolvePageIcon({ type: "notes" }),
);

// chiavi uniche nel catalogo
const keys = new Set(ICON_OPTIONS.map((o) => o.key));
check("chiavi uniche", keys.size === ICON_OPTIONS.length, `${keys.size} vs ${ICON_OPTIONS.length}`);

// set curato presente nel catalogo
for (const k of Object.keys(ICON_MAP)) {
  check(`curata nel catalogo: ${k}`, ICON_OPTIONS.some((o) => o.key === k));
}

console.log(fails === 0 ? "\nTUTTI I TEST OK" : `\n${fails} TEST FALLITI`);
process.exit(fails === 0 ? 0 : 1);
