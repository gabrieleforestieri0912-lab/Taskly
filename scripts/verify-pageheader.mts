import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PageHeader from "../src/components/PageHeader";
import { LanguageProvider } from "../src/lib/LanguageContext";
import { EditableTitle } from "../src/components/UIComponents";
import { Smile } from "lucide-react";

const step = (name: string, fn: () => string) => {
  try {
    const out = fn();
    console.log("ok  :", name, "len", out.length);
    return out;
  } catch (e: any) {
    console.log("FAIL:", name, "-", e.message);
    return "";
  }
};

console.log(
  "types ->",
  JSON.stringify({
    PageHeader: typeof PageHeader,
    PageHeaderHasDefault: !!(PageHeader as any)?.default,
    LanguageProvider: typeof LanguageProvider,
    EditableTitle: typeof EditableTitle,
    Smile: typeof Smile,
  }),
);

// tsx/interop: il default export CJS arriva spesso wrappato ({ default })
const PH: any = (PageHeader as any)?.default ?? (PageHeader as any);

const render = (page: any, title: string) =>
  renderToStaticMarkup(
    React.createElement(
      LanguageProvider,
      null,
      React.createElement(PH, {
        page,
        title,
        onRename: () => {},
        onIconChange: () => {},
      }),
    ),
  );

const cases: [string, any, string, string[]][] = [
  [
    // Senza icona: placeholder neutro + titolo in auto-edit (aria/textbox)
    "pagina senza icona",
    { id: "p1", type: "empty", icon: "" },
    "",
    ['aria-label="Cambia icona pagina"', 'role="textbox"'],
  ],
  [
    "icona kebab dal catalogo completo",
    { id: "p2", type: "empty", icon: "cup-soda" },
    "La mia pagina",
    ["La mia pagina"],
  ],
  [
    "icona PascalCase (formato storico)",
    { id: "p3", type: "tasks", icon: "FileText" },
    "Task",
    ["Task"],
  ],
  [
    "emoji",
    { id: "p4", type: "empty", icon: "\uD83D\uDD25" },
    "Boom",
    ["Boom"],
  ],
  [
    "icona curata",
    { id: "p5", type: "notes", icon: "layout-dashboard" },
    "Notte",
    ["Notte"],
  ],
];

let fails = 0;
for (const [name, page, title, mustContain] of cases) {
  let html = "";
  try {
    html = render(page, title);
  } catch (e: any) {
    fails++;
    console.log("FAIL:", name, "-", e.message);
    continue;
  }
  const missing = mustContain.filter((s) => !html.includes(s));
  if (missing.length) {
    fails++;
    console.log("FAIL:", name, "manca:", missing.join(", "));
  } else {
    console.log("ok  :", name, `(${html.length} bytes)`);
  }
}

step("Smile", () => renderToStaticMarkup(React.createElement(Smile as any) as any));

console.log(fails === 0 ? "\nPAGEHEADER OK" : `\n${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
