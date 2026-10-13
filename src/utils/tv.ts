import { createTV } from 'tailwind-variants';

const createTv = createTV({
  twMergeConfig: {
    extend: {
      theme: {
        color: [
          'background',
          'foreground',
          'primary',
          'primary-foreground',
          'secondary',
          'secondary-foreground',
          'destructive',
          'destructive-foreground',
          'border',
          'ring',
        ],
        container: ['container-max-width'],
        spacing: [
          'container-padding',
          'container-padding-sm',
          'container-padding-lg',
          'section-padding-none',
          'section-padding-sm',
          'section-padding-sm-md',
          'section-padding-default',
          'section-padding-default-md',
          'section-padding-lg',
          'section-padding-lg-md',
        ],
      },
    },
  },
});

export const tv = createTv;
export default tv;
export type { VariantProps } from 'tailwind-variants';
