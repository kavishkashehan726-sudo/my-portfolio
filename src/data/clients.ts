/**
 * Products I built that businesses use today, shown in the logo bar under the selected work.
 * To add one: put the logo in public/images/clients/ and add a line here. `tile` is the
 * background behind the logo: "light", "dark", or a colour matching the logo's own background.
 */
export type Client = { name: string; logo: string; tile: "light" | "dark" | `#${string}` };

export const clients: Client[] = [
  { name: "Maliban Distribution & Collection", logo: "/images/clients/maliban.webp", tile: "#0e1720" },
  { name: "Thesuki Channelling Centre", logo: "/images/clients/thesuki.webp", tile: "light" },
  { name: "Asian Lanka Academy & Recruitment Services", logo: "/images/clients/asian-lanka.webp", tile: "light" },
  { name: "Kaveena Hotel", logo: "/images/clients/kaveena-hotel.webp", tile: "dark" },
  { name: "Swarna Rashmi Kalayathanaya, Baddegama", logo: "/images/clients/swarna-rashmi.webp", tile: "light" },
  { name: "Law firm", logo: "/images/clients/law-firm.webp", tile: "light" },
];
