# Express Chi

View the status of the Chicago Kennedy express lanes
[expresschi.com](https://expresschi.com)

<p align="center">
  <img src="static/expresschimobile.webp" alt="Express Chi mobile"/>
  <img src="static/expresschi.webp" alt="Express Chi web"/>
</p>

## Usage

Make sure to install Deno:
<https://docs.deno.com/runtime/getting_started/installation/>

Then start the project:

```
deno task dev
```

This starts the Vite dev server and reloads as you edit.

Build and preview the production app:

```
deno task build
deno task preview
```

## Data

Direction comes from [Sigalert](https://www.sigalert.com/). Travel time, speed,
and congestion come from [Travel Midwest](https://travelmidwest.com/) (IDOT).
When IDOT is not reporting a live express-lane time, the page shows the typical
time for this time of week instead.

## Built With

- [Deno](https://deno.land) - The easiest, most secure JavaScript runtime.
- [Typescript](https://www.typescriptlang.org/) - JavaScript with syntax for
  types.
- [Fresh](https://fresh.deno.dev) - The next-gen web framework.
- [Preact](https://preactjs.com) - Fast 3kB alternative to React with the same
  modern API
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for
  rapidly building custom designs.
- [Vite](https://vitejs.dev/) - The build tool for the web.
- [Deno Deploy](https://deno.com/deploy) - Serverless JavaScript hosting with
  zero config, worldwide.
- [IDOT](https://idot.illinois.gov/) - Gateway traffic information courtesy of
  the Illinois Department of Transportation
- [Sigalert](https://www.sigalert.com/) - Express lane direction

## Authors

- [Alex Matseshe](https://github.com/ajmhyd)

## Contributors

- [Albert Portnoy](https://github.com/asportnoy)
- [Maxwell Cohen](https://github.com/MaxwellCohen)

## License

[MIT](LICENSE)
