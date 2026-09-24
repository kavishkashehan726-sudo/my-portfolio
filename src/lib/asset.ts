// Static export on GitHub Pages lives under a sub-path; plain <img> tags need it prefixed.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${base}${path}`;
