# Acoustic Matrix: Design System & Color Palette

The **Acoustic Matrix** aesthetic is defined by deep slate backgrounds, golden resonance accents, and high-fidelity typography. It is designed to evoke the feeling of a professional clinical ultrasound console.

## Core Palette

| Color Name        | Hex Code  | Tailwind Class          | Usage                                      |
|-------------------|-----------|-------------------------|--------------------------------------------|
| **Slate Deep**    | `#020617` | `bg-slate-950`          | Primary background, deep space             |
| **Gold Main**     | `#B5944E` | `bg-gold-main`          | Primary accents, buttons, active nodes     |
| **Gold Accent**   | `#D4AF37` | `text-gold-accent`      | Highlights, secondary emphasis             |
| **Gold Glow**     | `rgba(181, 148, 78, 0.4)` | `shadow-gold` | Interactive feedback, active states        |

## Typography

| Style             | Font Family             | Usage                                      |
|-------------------|-------------------------|--------------------------------------------|
| **Display**       | 'Playfair Display'      | Headings, clinical titles, italic emphasis |
| **Body**          | 'Inter'                 | General UI, reading content, labels        |
| **Technical**     | 'Fira Code'             | Data nodes, progress metrics, status logs  |

## UI Components

- **Glass Dossier**: `bg-white/[0.02] backdrop-blur-2xl border border-white/5`
- **Sonar Grid**: `radial-gradient(rgba(181, 148, 78, 0.1) 1px, transparent 1px)`
- **Shadow Gold**: `0 0 20px rgba(181, 148, 78, 0.2)`

## Animations

- **Sonar Ping**: Pulsing radial expansion for background elements.
- **Radio Wave**: Dynamic vertical bars for active audio/narration.
- **Fade In**: Smooth entry for all clinical modules.
