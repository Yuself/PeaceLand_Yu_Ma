import type { GraphEdge, GraphNode } from "../types/graph";

const SHEET_NS = "urn:schemas-microsoft-com:office:spreadsheet";

const NODE_HEADERS = [
  "id",
  "title",
  "kind",
  "role",
  "level",
  "x",
  "y",
  "width",
  "height",
  "confirmed",
  "memoryAccess",
  "enterButton",
  "day1",
  "day2",
  "day3",
  "day4",
  "day5",
  "day6",
  "day7",
  "npcs",
  "interactions",
  "bools",
  "unlocks",
  "queryPath",
  "imageSrc",
  "imageAlt",
  "summary",
  "detail"
] as const;

const EDGE_HEADERS = [
  "id",
  "from",
  "to",
  "label",
  "type",
  "sourceHandle",
  "targetHandle",
  "animated"
] as const;

type WorkbookMeta = {
  editorName?: string;
  exportedAt?: string;
  graphLabel?: string;
};

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeCell(value: string) {
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function makeWorksheet(name: string, headers: readonly string[], rows: string[][]) {
  const headerXml = `<Row>${headers.map((header) => makeCell(header)).join("")}</Row>`;
  const rowXml = rows.map((row) => `<Row>${row.map((value) => makeCell(value)).join("")}</Row>`).join("");
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${headerXml}${rowXml}</Table></Worksheet>`;
}

function serializeLines(values: string[]) {
  return values.join("\n");
}

function serializeBools(values: Array<[string, boolean]>) {
  return values.map(([label, value]) => `${label}: ${value ? "true" : "false"}`).join("\n");
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string, fallback = false) {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseBools(value: string) {
  const lines = parseLines(value);
  if (lines.length === 0) {
    return [] as Array<[string, boolean]>;
  }

  return lines.map((line) => {
    const separatorIndex = line.lastIndexOf(":");
    if (separatorIndex === -1) {
      return [line, false] as [string, boolean];
    }

    const label = line.slice(0, separatorIndex).trim();
    const boolValue = parseBoolean(line.slice(separatorIndex + 1), false);
    return [label || "Flag", boolValue] as [string, boolean];
  });
}

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildNodeRow(node: GraphNode) {
  return [
    node.id,
    node.title,
    node.kind,
    node.role ?? "",
    String(node.level ?? ""),
    String(node.x),
    String(node.y),
    String(node.width ?? ""),
    String(node.height ?? ""),
    String(node.confirmed),
    node.memoryAccess,
    String(Boolean(node.enterButton)),
    node.dayOpen[1] ?? "",
    node.dayOpen[2] ?? "",
    node.dayOpen[3] ?? "",
    node.dayOpen[4] ?? "",
    node.dayOpen[5] ?? "",
    node.dayOpen[6] ?? "",
    node.dayOpen[7] ?? "",
    serializeLines(node.npcs),
    serializeLines(node.interactions),
    serializeBools(node.bools),
    serializeLines(node.unlocks),
    serializeLines(node.queryPath),
    node.imageSrc ?? "",
    node.imageAlt ?? "",
    node.summary,
    node.detail
  ];
}

function buildEdgeRow(edge: GraphEdge) {
  return [
    edge.id,
    edge.from,
    edge.to,
    edge.label ?? "",
    edge.type ?? "",
    edge.sourceHandle ?? "",
    edge.targetHandle ?? "",
    String(Boolean(edge.animated))
  ];
}

function parseWorksheetRows(doc: Document, sheetName: string) {
  const worksheets = Array.from(doc.getElementsByTagNameNS(SHEET_NS, "Worksheet"));
  const worksheet = worksheets.find(
    (sheet) => sheet.getAttributeNS(SHEET_NS, "Name") === sheetName || sheet.getAttribute("ss:Name") === sheetName
  );

  if (!worksheet) {
    return [] as string[][];
  }

  const rows = Array.from(worksheet.getElementsByTagNameNS(SHEET_NS, "Row"));

  return rows.map((row) => {
    const cells = Array.from(row.getElementsByTagNameNS(SHEET_NS, "Cell"));
    const values: string[] = [];

    for (const cell of cells) {
      const indexAttr = cell.getAttributeNS(SHEET_NS, "Index") ?? cell.getAttribute("ss:Index");
      if (indexAttr) {
        const targetIndex = Number(indexAttr) - 1;
        while (values.length < targetIndex) {
          values.push("");
        }
      }

      const data = cell.getElementsByTagNameNS(SHEET_NS, "Data")[0];
      values.push(data?.textContent ?? "");
    }

    return values;
  });
}

function rowsToObjects<T extends readonly string[]>(rows: string[][], headers: T) {
  const [, ...bodyRows] = rows;
  return bodyRows
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) =>
      headers.reduce<Record<string, string>>((record, header, index) => {
        record[header] = row[index] ?? "";
        return record;
      }, {})
    );
}

export function exportGraphWorkbookXml(graphId: string, nodes: GraphNode[], edges: GraphEdge[], meta: WorkbookMeta = {}) {
  const nodeRows = nodes.map(buildNodeRow);
  const edgeRows = edges.map(buildEdgeRow);
  const exportedAt = meta.exportedAt ?? new Date().toISOString();
  const metaRows = [
    ["graphId", graphId],
    ["graphLabel", meta.graphLabel ?? graphId],
    ["exportedAt", exportedAt],
    ["editorName", meta.editorName ?? ""],
    ["nodeCount", String(nodes.length)],
    ["edgeCount", String(edges.length)],
    ["workflow", "Edit in site -> Export workbook -> Upload to Drive"]
  ];

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${makeWorksheet("Nodes", NODE_HEADERS, nodeRows)}
${makeWorksheet("Edges", EDGE_HEADERS, edgeRows)}
${makeWorksheet("Meta", ["key", "value"], metaRows)}
</Workbook>`;
}

export function parseGraphWorkbookXml(xmlText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    throw new Error("Workbook XML could not be parsed.");
  }

  const nodeRows = parseWorksheetRows(doc, "Nodes");
  const edgeRows = parseWorksheetRows(doc, "Edges");

  if (nodeRows.length === 0 || edgeRows.length === 0) {
    throw new Error("Workbook must include Nodes and Edges sheets.");
  }

  const nodeObjects = rowsToObjects(nodeRows, NODE_HEADERS);
  const edgeObjects = rowsToObjects(edgeRows, EDGE_HEADERS);

  const nodes: GraphNode[] = nodeObjects.map((row, index) => ({
    id: row.id || `node-${index + 1}`,
    title: row.title || `Node ${index + 1}`,
    kind: (row.kind as GraphNode["kind"]) || "scene",
    role: row.role ? (row.role as GraphNode["role"]) : undefined,
    level: row.level ? (Number(row.level) as GraphNode["level"]) : undefined,
    x: parseNumber(row.x, 80 + index * 24),
    y: parseNumber(row.y, 80 + index * 24),
    width: row.width ? parseNumber(row.width) : undefined,
    height: row.height ? parseNumber(row.height) : undefined,
    confirmed: parseBoolean(row.confirmed, false),
    memoryAccess: row.memoryAccess || "Draft",
    enterButton: parseBoolean(row.enterButton, false),
    dayOpen: {
      1: row.day1 || "Draft",
      2: row.day2 || row.day1 || "Draft",
      3: row.day3 || row.day1 || "Draft",
      4: row.day4 || row.day1 || "Draft",
      5: row.day5 || row.day1 || "Draft",
      6: row.day6 || row.day1 || "Draft",
      7: row.day7 || row.day1 || "Draft"
    },
    npcs: parseLines(row.npcs),
    interactions: parseLines(row.interactions),
    bools: parseBools(row.bools),
    unlocks: parseLines(row.unlocks),
    queryPath: parseLines(row.queryPath),
    imageSrc: row.imageSrc || undefined,
    imageAlt: row.imageAlt || undefined,
    summary: row.summary || "",
    detail: row.detail || ""
  }));

  const edges: GraphEdge[] = edgeObjects.map((row, index) => ({
    id: row.id || `edge-${index + 1}`,
    from: row.from,
    to: row.to,
    label: row.label || undefined,
    type: row.type ? (row.type as GraphEdge["type"]) : undefined,
    sourceHandle: row.sourceHandle || undefined,
    targetHandle: row.targetHandle || undefined,
    animated: parseBoolean(row.animated, false)
  }));

  const validNodeIds = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: edges.filter((edge) => validNodeIds.has(edge.from) && validNodeIds.has(edge.to))
  };
}

export function downloadTextFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function makeExportStamp() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ];

  return `${parts[0]}-${parts[1]}-${parts[2]}_${parts[3]}${parts[4]}`;
}
