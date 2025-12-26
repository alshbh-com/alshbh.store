import GlassHeader from './GlassHeader';
import MinimalHeader from './MinimalHeader';
import GradientHeader from './GradientHeader';
import DarkSolidHeader from './DarkSolidHeader';

export const headerStyles = [
  { id: 'glass', name: 'زجاجي', nameEn: 'Glass', component: GlassHeader },
  { id: 'minimal', name: 'بسيط', nameEn: 'Minimal', component: MinimalHeader },
  { id: 'gradient', name: 'متدرج', nameEn: 'Gradient', component: GradientHeader },
  { id: 'dark', name: 'مظلم', nameEn: 'Dark Solid', component: DarkSolidHeader },
] as const;

export type HeaderStyleId = typeof headerStyles[number]['id'];

export { GlassHeader, MinimalHeader, GradientHeader, DarkSolidHeader };
