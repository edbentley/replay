module.exports = {
  title: "Replay",
  tagline: "A cross-platform JS game engine inspired by React",
  url: "https://replay.js.org",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "edbentley",
  projectName: "replay",
  plugins: ["@docusaurus/plugin-google-analytics"],
  themeConfig: {
    image: "/img/social-image.png",
    disableDarkMode: true,
    navbar: {
      // title: "Replay",
      logo: {
        alt: "Replay Logo",
        src: "img/logo.svg",
      },
      links: [
        { to: "tutorial", label: "Tutorial", position: "left" },
        {
          to: "docs/intro",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        { to: "blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/edbentley/replay",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Learn",
          items: [
            {
              label: "Tutorial",
              to: "tutorial",
            },
            {
              label: "Docs",
              to: "docs/intro",
            },
          ],
        },
        {
          title: "Channels",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/edbentley/replay",
            },
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/replayjs",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
          ],
        },
      ],
    },
    googleAnalytics: {
      trackingID: "UA-165350226-1",
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/edbentley/replay/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/edbentley/replay/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
