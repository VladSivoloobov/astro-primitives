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
npx astro-primitives add button badge title box
npx astro-primitives add container section header footer
npx astro-primitives add gridlayout stack
npx astro-primitives add input textarea separator skeleton
npx astro-primitives add logo tv theme
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

### Basic example: page header and CTA

```astro
---
import Container from '../components/ui/Container.astro';
import Section from '../components/ui/Section.astro';
import Title from '../components/ui/Title.astro';
import Button from '../components/ui/Button.astro';
import Badge from '../components/ui/Badge.astro';
---

<Container>
  <Section spacing="lg">
    <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge variant="secondary">New</Badge>
        <Title as="h1" level="h1" class="mt-4">
          Build faster with Astro primitives
        </Title>
        <p class="mt-3 max-w-xl text-sm text-muted-foreground">
          Copy the components you need, style them once, and keep the rest of the app untouched.
        </p>
      </div>

      <Button href="/docs" variant="default" size="lg">
        Read docs
      </Button>
    </div>
  </Section>
</Container>
```

### Title variants

`Title` is a semantic heading helper. You can choose the heading level, alignment, weight, and custom class names:

```astro
---
import Title from '../components/ui/Title.astro';
---

<Title as="h2" level="h2" align="left" weight="bold">
  Product overview
</Title>

<Title as="h3" level="h3" align="center" weight="medium">
  Simple and flexible
</Title>
```

### Box grid and layout composition

```astro
---
import GridLayout from '../components/ui/GridLayout.astro';
import Stack from '../components/ui/Stack.astro';
import Box from '../components/ui/Box.astro';
import Button from '../components/ui/Button.astro';
import Title from '../components/ui/Title.astro';
---

<Stack as="header" orientation="horizontal" align="center" justify="between" gap="lg" class="mb-8">
  <Title as="h2" level="h3">Dashboard</Title>
  <Button size="sm">Add item</Button>
</Stack>

<GridLayout columns={3} gap="lg">
  <Box>
    <Title as="h3" level="h4">Analytics</Title>
    <p>Track engagement and conversion.</p>
  </Box>

  <Box>
    <Title as="h3" level="h4">Projects</Title>
    <p>Keep all workstreams organized.</p>
  </Box>

  <Box>
    <Title as="h3" level="h4">Billing</Title>
    <p>Monitor current usage and renewals.</p>
  </Box>
</GridLayout>
```

### Form controls and section spacing

```astro
---
import Section from '../components/ui/Section.astro';
import Container from '../components/ui/Container.astro';
import Input from '../components/ui/Input.astro';
import Textarea from '../components/ui/Textarea.astro';
import Button from '../components/ui/Button.astro';
import Separator from '../components/ui/Separator.astro';
---

<Container>
  <Section spacing="default">
    <form class="space-y-4">
      <Input type="email" placeholder="Email address" />
      <Textarea placeholder="Project details" rows={5} />

      <Separator />

      <Button type="submit" variant="default">Send inquiry</Button>
    </form>
  </Section>
</Container>
```

`Button` also renders a native button when `href` is omitted, and forwards native button attributes such as `type` and `disabled`. `Badge` accepts either slot content or a `text` prop. `Container` uses `--container-max-width` for its maximum width. `Section` supports `none`, `sm`, `default`, and `lg` spacing with adjustable `--section-padding-*` variables. `Logo` accepts `label` and `href`, and `Header`/`Footer` provide semantic wrappers for project-specific content. `Title` gives you semantic heading styles with `level`, `align`, and `weight` variants.

## Theme and Tailwind CSS

The components use semantic color utilities such as `bg-primary` and `text-foreground`, backed by CSS variables in the theme stylesheet. Change the values in `:root` to customize the palette, `--container-max-width` and `--container-padding*` to adjust the container width and horizontal padding, and `--section-padding-*` to adjust section spacing. The theme uses Tailwind CSS 4's `@theme inline` directive. Since the component files are copied into `src`, Tailwind can scan them using the project's normal source detection.

Add non-conflicting classes with `class`, select a built-in `variant` or `size`, or edit the copied component to replace its default Tailwind styles and match your own design system.
