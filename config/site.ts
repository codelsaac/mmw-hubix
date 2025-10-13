export const siteConfig = {
  name: "MMW Hubix",
  description: "School Information Portal for C.C.C. Mong Man Wai College",
  url: "https://mmw-hubix.vercel.app",
  ogImage: "https://mmw-hubix.vercel.app/og.png",
  mainNav: [
    {
      title: "Resource Hub",
      href: "/",
    },
    {
      title: "Announcements",
      href: "/announcements",
    },
    {
      title: "Internal Dashboard",
      href: "/dashboard",
    },
  ],
  links: {
    twitter: "https://twitter.com/cccmmw",
    github: "https://github.com/your-org/mmw-hubix",
    schoolSite: "https://www.cccmmwc.edu.hk",
  },
}

export type SiteConfig = typeof siteConfig
