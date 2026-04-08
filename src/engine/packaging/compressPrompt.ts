import { IRNode } from "../contracts/packageTypes";

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function has(keys: string[], target: string): boolean {
  return keys.includes(target);
}

function buildRoleBundle(nodes: IRNode[]): string | null {
  const role = nodes.find((node) => node.domain === "role");
  if (!role) return null;

  const keys = nodes.map((node) => node.canonicalKey);
  const parts: string[] = [];

  if (has(keys, "close_mic") && !role.text.includes("close-mic")) parts.push("close-mic");
  if (has(keys, "intimate") && !role.text.includes("intimate")) parts.push("intimate");
  parts.push(role.text);

  return unique(parts).join(" ").replace(/\s+/g, " ").trim();
}

function buildSurfaceCoreContrast(nodes: IRNode[]): string | null {
  const surface = nodes.find((node) => node.domain === "surface");
  const core = nodes.find((node) => node.domain === "core");
  if (!surface && !core) return null;
  if (surface && core) {
    return `${surface.text}, ${core.text}`;
  }
  return surface?.text ?? core?.text ?? null;
}

function buildDeliveryMotion(nodes: IRNode[]): string | null {
  const delivery = nodes.find((node) => node.domain === "delivery");
  const motion = nodes.find((node) => node.domain === "motion");
  if (delivery && motion) {
    if (delivery.canonicalKey === "conversational" && motion.canonicalKey === "gradual_rise") {
      return "conversational phrasing with gradual rise";
    }
    return `${delivery.text} with ${motion.text}`;
  }
  return delivery?.text ?? motion?.text ?? null;
}

export function compressPrompt(nodes: IRNode[]): string {
  const genre = nodes.find((node) => node.domain === "genre")?.text ?? null;
  const roleBundle = buildRoleBundle(nodes);
  const surfaceCore = buildSurfaceCoreContrast(nodes);
  const deliveryMotion = buildDeliveryMotion(nodes);
  const production = nodes.filter((node) => node.domain === "production").map((node) => node.text);

  return unique([genre, roleBundle, surfaceCore, deliveryMotion, ...production].filter(Boolean) as string[]).join(", ");
}
