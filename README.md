# ✨ Copy Spell

A magical incantation for capturing color essences from your Figma designs. Part of the **Design Tokens Wizards**.

## The Spell

Cast the Copy Spell upon any element in your Figma canvas to reveal and capture its color essences in their purest hexadecimal form. This enchantment automatically seeks out all color magic within your selection, including nested components and child elements.

## Magical Properties

- 🔮 Automatically extracts all color essences from selected elements
- 📜 Summon individual colors with a single incantation
- ⚡ Capture all colors simultaneously
- 🌟 Spell updates automatically when you shift your gaze
- 🎯 Discovers colors hidden within child elements
- ✨ Banishes duplicate color spirits

## Summoning the Spell

1. Gather the mystical dependencies:

```bash
npm install
```

2. Compile the ancient TypeScript runes:

```bash
npm run build
```

3. In the Figma Spell Chamber (Desktop):
   - Navigate to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` scroll from this grimoire

## Casting Instructions

1. Invoke the spell from `Plugins` → `Development` → `Copy Spell`
2. Select one or more elements on your Figma canvas
3. The spell will reveal all color essences discovered
4. Click any color to copy its hexadecimal essence to your spellbook (clipboard)
5. Or use the "Copy All Colors" incantation to capture all at once

## Development Rituals

To work on the spell with automatic recompilation:

```bash
npm run watch
```

This enchantment will automatically recompile changes in `code.ts` as you craft new magic.

## Grimoire Structure

- `manifest.json` - The spell's configuration scroll
- `code.ts` - Core magical logic
- `ui.html` - The spell's visual interface
- `tsconfig.json` - TypeScript transmutation rules
- `package.json` - Dependency artifacts and ritual commands

## Design Tokens Wizards Realm

This spell is part of the larger **Design Tokens Wizards Realm**, a collection of magical tools and enchantments for capturing, transforming, and managing design tokens across your creative domains.

## Spell Limitations

- Currently only captures solid color essences (SOLID fills)
- Invisible or dormant color spirits are respectfully ignored
- Colors manifest in uppercase hexadecimal format (#RRGGBB)
