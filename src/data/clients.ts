/**
 * Products I built that businesses use today, shown in the logo bar under the selected work.
 * To add one: put the logo in public/images/clients/ and add a line here. `tile` is the
 * background behind the logo, so dark logos sit on white and light ones on black.
 */
export type Client = { name: string; logo: string; tile: "light" | "dark" };

export const clients: Client[] = [
  { name: "Thesuki Channelling Centre", logo: "/images/clients/thesuki.webp", tile: "light" },
  { name: "Asian Lanka Academy & Recruitment Services", logo: "/images/clients/asian-lanka.webp", tile: "light" },
  { name: "Kaveena Hotel", logo: "/images/clients/kaveena-hotel.webp", tile: "dark" },
  { name: "Swarna Rashmi Kalayathanaya, Baddegama", logo: "/images/clients/swarna-rashmi.webp", tile: "light" },
];
