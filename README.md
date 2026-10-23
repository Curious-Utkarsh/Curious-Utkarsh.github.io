# curious-utkarsh.github.io

Personal portfolio of Kumar Utkarsh, robotics engineer and founder of MechaMind Labs.
Live at https://curious-utkarsh.github.io/

Plain static HTML, CSS and a little JavaScript. No build step, no framework, no trackers.
GitHub Pages serves this repository from `main`, root folder (`.nojekyll` turns off Jekyll).

## Layout

```
index.html                 home page (all sections)
projects/<slug>/index.html case studies: scara, mechabot, mobi, manipulation
404.html                   not-found page
assets/css/site.css        design tokens (light + dark), layout, components
assets/js/site.js          theme toggle, nav, video dialog, YouTube click-to-play
assets/fonts/              self-hosted Newsreader and IBM Plex (SIL Open Font License)
assets/img/                photos and video stills (WebP), og.jpg for link previews
```

## Editing

- Content rules, sources and decisions live in the private `portfolio-ops` repo
  (WEBSITE_BUILD_BRIEF.md, drafts/portfolio-spec.md). Change the facts there first.
- Every claim on the site links to a public source. No unverified numbers.
- Videos (YouTube and the MechaMind Labs website) load only when a visitor presses play.
