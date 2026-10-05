"use client";

import { Fragment, type ReactNode } from "react";
import {
  Badge,
  Callout,
  FeatureTable,
  Kbd,
  Screenshot,
  Step,
  Steps,
  Tabs,
} from "./DocComponents";

function renderInline(text: string): ReactNode[] {
  const tokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(tokenPattern).filter(Boolean);

  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2].trim();
      if (/^(https?:\/\/|\/|#)/.test(href)) {
        return (
          <a
            key={index}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="font-medium text-[#7b39fc] underline decoration-[#7b39fc]/30 underline-offset-2 hover:decoration-[#7b39fc] dark:text-[#a67cff]"
          >
            {link[1]}
          </a>
        );
      }
      return <Fragment key={index}>{link[1]}</Fragment>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <Kbd key={index}>{part.slice(1, -1)}</Kbd>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function headingId(text: string, used: Map<string, number>) {
  const base = text
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function directiveProps(source: string) {
  return Object.fromEntries(
    Array.from(source.matchAll(/([\w-]+)="([^"]*)"/g), (match) => [
      match[1],
      match[2],
    ]),
  );
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

export function DocContent({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/);
  const usedHeadingIds = new Map<string, number>();

  const renderLines = (start: number, end: number): ReactNode[] => {
    const output: ReactNode[] = [];
    let index = start;

    while (index < end) {
      const line = lines[index].trim();
      if (!line) {
        index += 1;
        continue;
      }

      const directive = line.match(/^:::([\w-]+)(?:\s+(.+))?$/);
      if (directive) {
        let close = index + 1;
        while (close < end && lines[close].trim() !== ":::") close += 1;
        const body = renderLines(index + 1, close);
        const args = (directive[2] || "").trim();
        if (directive[1] === "callout") {
          const type = args.split(/\s+/, 1)[0] || "note";
          const allowed = ["note", "tip", "warning", "danger"] as const;
          output.push(
            <Callout
              key={`callout-${index}`}
              type={allowed.includes(type as (typeof allowed)[number]) ? (type as (typeof allowed)[number]) : "note"}
            >
              {body}
            </Callout>,
          );
        } else if (directive[1] === "steps") {
          output.push(<Steps key={`steps-${index}`}>{body}</Steps>);
        } else if (directive[1] === "step") {
          output.push(
            <Step key={`step-${index}`} title={args.replace(/^["']|["']$/g, "")}>
              {body}
            </Step>,
          );
        } else if (directive[1] === "tabs") {
          output.push(<Tabs key={`tabs-${index}`}>{body}</Tabs>);
        } else if (directive[1] === "badge") {
          output.push(<Badge key={`badge-${index}`}>{args}</Badge>);
        } else if (directive[1] === "screenshot") {
          const props = directiveProps(args);
          output.push(
            <Screenshot
              key={`screenshot-${index}`}
              alt={props.alt || "Schermata Taskly"}
              caption={props.caption || ""}
            />,
          );
        }
        index = close < end ? close + 1 : end;
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        const depth = heading[1].length;
        const text = heading[2].replace(/[`*_~]/g, "").trim();
        const id = headingId(text, usedHeadingIds);
        const className =
          depth === 1
            ? "mb-4 mt-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            : depth === 2
              ? "mb-3 mt-9 scroll-mt-24 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
              : "mb-2 mt-6 scroll-mt-24 text-base font-semibold text-gray-900 dark:text-white";
        const Tag = `h${depth}` as "h1" | "h2" | "h3";
        output.push(
          <Tag key={`heading-${index}`} id={id} className={className}>
            {renderInline(heading[2])}
          </Tag>,
        );
        index += 1;
        continue;
      }

      const fence = line.match(/^```([\w-]*)$/);
      if (fence) {
        let close = index + 1;
        while (close < end && !lines[close].trim().startsWith("```")) close += 1;
        output.push(
          <pre key={`code-${index}`} className="my-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100">
            <code>{lines.slice(index + 1, close).join("\n")}</code>
          </pre>,
        );
        index = close < end ? close + 1 : end;
        continue;
      }

      if (
        line.startsWith("|") &&
        index + 1 < end &&
        /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())
      ) {
        const headers = splitTableRow(line);
        index += 2;
        const rows: string[][] = [];
        while (index < end && lines[index].trim().startsWith("|")) {
          rows.push(splitTableRow(lines[index]));
          index += 1;
        }
        output.push(<FeatureTable key={`table-${index}`} headers={headers} rows={rows} />);
        continue;
      }

      const list = line.match(/^(\d+\.|[-*])\s+(.+)$/);
      if (list) {
        const ordered = list[1].endsWith(".");
        const items: ReactNode[] = [];
        while (index < end) {
          const item = lines[index].trim().match(/^(\d+\.|[-*])\s+(.+)$/);
          if (!item || item[1].endsWith(".") !== ordered) break;
          items.push(<li key={index}>{renderInline(item[2])}</li>);
          index += 1;
        }
        const ListTag = ordered ? "ol" : "ul";
        output.push(
          <ListTag
            key={`list-${index}`}
            className={`my-4 space-y-2 pl-6 text-sm leading-6 text-gray-700 dark:text-gray-300 ${ordered ? "list-decimal" : "list-disc"}`}
          >
            {items}
          </ListTag>,
        );
        continue;
      }

      if (line.startsWith(">")) {
        output.push(
          <Callout key={`quote-${index}`} type="note">
            <p>{renderInline(line.replace(/^>\s?/, ""))}</p>
          </Callout>,
        );
        index += 1;
        continue;
      }

      const paragraph: string[] = [line];
      index += 1;
      while (index < end) {
        const next = lines[index].trim();
        if (
          !next ||
          /^(#{1,3})\s/.test(next) ||
          /^:::/.test(next) ||
          /^```/.test(next) ||
          /^(\d+\.|[-*])\s/.test(next) ||
          next.startsWith("|") ||
          next.startsWith(">")
        ) {
          break;
        }
        paragraph.push(next);
        index += 1;
      }
      output.push(
        <p key={`paragraph-${index}`} className="my-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
          {renderInline(paragraph.join(" "))}
        </p>,
      );
    }

    return output;
  };

  return <div className="docs-prose">{renderLines(0, lines.length)}</div>;
}
