// This plugin extracts hex colors from selected elements

figma.showUI(__html__, { width: 300, height: 400 });

// Function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Interface for color data
interface ColorData {
  hex: string;
  name?: string;
  type?: 'style' | 'variable';
}

// Function to extract colors from a node
async function extractColors(node: SceneNode): Promise<ColorData[]> {
  const colors: ColorData[] = [];

  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const { r, g, b } = fill.color;
        const hex = rgbToHex(r, g, b);

        let colorName: string | undefined;
        let colorType: 'style' | 'variable' | undefined;

        // Check if it's bound to a variable
        if ('boundVariables' in fill && fill.boundVariables?.color) {
          try {
            const variable = await figma.variables.getVariableByIdAsync(fill.boundVariables.color.id);
            if (variable) {
              colorName = variable.name;
              colorType = 'variable';
            }
          } catch (e) {
            // Variable might not be accessible
          }
        }

        // Check if it's using a paint style
        if (!colorName && 'fillStyleId' in node && node.fillStyleId && typeof node.fillStyleId === 'string') {
          try {
            const style = await figma.getStyleByIdAsync(node.fillStyleId);
            if (style) {
              colorName = style.name;
              colorType = 'style';
            }
          } catch (e) {
            // Style might not be accessible
          }
        }

        colors.push({
          hex,
          name: colorName,
          type: colorType
        });
      }
    }
  }

  return colors;
}

// Function to get all colors from selection
async function getColorsFromSelection(): Promise<{ colors: ColorData[], count: number }> {
  const selection = figma.currentPage.selection;
  const allColors: ColorData[] = [];

  if (selection.length === 0) {
    return { colors: [], count: 0 };
  }

  for (const node of selection) {
    const colors = await extractColors(node);
    allColors.push(...colors);

    // Also check children if it's a container
    if ('children' in node) {
      const walk = async (n: SceneNode) => {
        const nodeColors = await extractColors(n);
        allColors.push(...nodeColors);

        if ('children' in n) {
          for (const child of n.children) {
            await walk(child);
          }
        }
      };

      for (const child of node.children) {
        await walk(child);
      }
    }
  }

  // Remove duplicates by hex value
  const uniqueColorsMap = new Map<string, ColorData>();
  for (const color of allColors) {
    if (!uniqueColorsMap.has(color.hex)) {
      uniqueColorsMap.set(color.hex, color);
    }
  }

  return { colors: Array.from(uniqueColorsMap.values()), count: selection.length };
}

// Listen for selection changes
figma.on('selectionchange', async () => {
  const result = await getColorsFromSelection();
  figma.ui.postMessage({
    type: 'colors-updated',
    colors: result.colors,
    selectionCount: result.count
  });
});

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-colors') {
    const result = await getColorsFromSelection();
    figma.ui.postMessage({
      type: 'colors-updated',
      colors: result.colors,
      selectionCount: result.count
    });
  } else if (msg.type === 'copy-color') {
    figma.notify(`✓ ${msg.color} copied!`);
  } else if (msg.type === 'copy-all') {
    figma.notify(`✓ ${msg.count} colors copied!`);
  } else if (msg.type === 'copy-error') {
    figma.notify(`✗ Failed to copy: ${msg.error}`, { error: true });
  }
};

// Send initial colors
(async () => {
  const initialResult = await getColorsFromSelection();
  figma.ui.postMessage({
    type: 'colors-updated',
    colors: initialResult.colors,
    selectionCount: initialResult.count
  });
})();
