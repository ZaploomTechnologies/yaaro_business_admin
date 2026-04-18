import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "yaaro admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, Yaaro Admin.`,
  meta: {
    title: "Yaaro Admin - Admin Dashboard",
    description:
      "Yaaro Admin Dashboard - Built with Next.js 16, Tailwind CSS v4, and shadcn/ui. Admin panel for managing exercises, equipment, users, and more.",
  },
  POINTS_PER_RS: 10,
};
