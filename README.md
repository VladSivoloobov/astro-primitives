# Astro Primitives

[![License: ISC](https://img.shields.io/badge/license-ISC-007EC6?style=for-the-badge)](./package.json) [![Astro](https://img.shields.io/badge/Astro-0C1222?style=for-the-badge&logo=astro&logoColor=FDFDFE)](https://astro.build/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![tailwind-variants](https://img.shields.io/badge/tailwind--variants-3.x-38BDF8?style=for-the-badge)](https://www.tailwind-variants.org/)

Composable Astro UI components that you add to your project and own. The CLI copies the selected `.astro` files into your source tree; after that, edit their markup, props, and Tailwind classes directly.

## Install components

Install the CLI in your Astro project:

```sh
npm install -D astro-primitives
```

Then add only the components you need:

```sh
npx astro-primitives add button badge
npx astro-primitives add container section
npx astro-primitives add gridlayout stack card
npx astro-primitives add input textarea separator skeleton
npx astro-primitives add tv
npx astro-primitives add theme
```

Components are added to `src/components/ui`, and `tv` is added to `src/utils/tv.ts`. Components that use variants automatically add `tv` as a dependency. Components with theme styles also add `src/theme.css`. If `src/global.css` does not exist, the CLI copies the complete stylesheet template from the package. If it already exists, the CLI preserves it and adds the theme import only when missing. You can also add just the theme with `npx astro-primitives add theme`. Existing files are preserved by default. Pass `--overwrite` only when you want to replace component or theme files, or use `--all` to add every available component and utility.

```sh
npx astro-primitives list
npx astro-primitives add --all
```

The `tv` utility exports a configured `tv` instance and `VariantProps` from `tailwind-variants`. Its `tailwind-merge` theme includes the color, container-width, and spacing tokens from the theme stylesheet. Install `tailwind-variants` in your project to use the copied variant components:

```sh
npm install tailwind-variants
```

## Use a component

```astro
---
import Button from '../components/ui/Button.astro';
import Badge from '../components/ui/Badge.astro';
---

<Button href="/get-started" variant="outline" size="lg">
  Get started
</Button>

<Badge variant="secondary">New</Badge>
```

`GridLayout` provides configurable columns and gaps. `Stack` lays out children vertically by default and supports `orientation="horizontal"` or `orientation="vertical"`, along with gap and alignment props. Both `Stack` and `GridLayout` accept `as="div"`, `as="ul"`, or `as="ol"` (default: `div`) to choose their root element. Use `<li>` children when rendering a list. `Card` supports adjustable padding. `Input` and `Textarea` expose size, invalid, and resize styling options. `Separator` supports horizontal and vertical orientations, and `Skeleton` provides an accessible loading placeholder.

```astro
---
import GridLayout from '../components/ui/GridLayout.astro';
import Stack from '../components/ui/Stack.astro';
import Card from '../components/ui/Card.astro';
import Button from '../components/ui/Button.astro';
---

<Stack as="ul" orientation="horizontal" align="center" gap="lg">
  <li>
  <h2>Dashboard</h2>
  </li>
  <li>
  <Button size="sm">Add item</Button>
  </li>
</Stack>

<GridLayout as="ol" columns={3} gap="lg">
  <li><Card>First card</Card></li>
  <li><Card>Second card</Card></li>
  <li><Card>Third card</Card></li>
</GridLayout>
```

`Button` also renders a native button when `href` is omitted, and forwards native button attributes such as `type` and `disabled`. `Badge` accepts either slot content or a `text` prop. `Container` uses `--container-max-width` for its maximum width. `Section` supports `none`, `sm`, `default`, and `lg` spacing with adjustable `--section-padding-*` variables. `Logo` accepts `label` and `href`, and `Header`/`Footer` provide semantic wrappers for project-specific content.

## Theme and Tailwind CSS

The components use semantic color utilities such as `bg-primary` and `text-foreground`, backed by CSS variables in the theme stylesheet. Change the values in `:root` to customize the palette, `--container-max-width` and `--container-padding*` to adjust the container width and horizontal padding, and `--section-padding-*` to adjust section spacing. The theme uses Tailwind CSS 4's `@theme inline` directive. Since the component files are copied into `src`, Tailwind can scan them using the project's normal source detection.

Add non-conflicting classes with `class`, select a built-in `variant` or `size`, or edit the copied component to replace its default Tailwind styles and match your own design system.
