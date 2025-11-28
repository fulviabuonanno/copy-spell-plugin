// This plugin extracts hex colors and gradients from selected elements

figma.showUI(__html__, {
  width: 320,
  height: 480,
  themeColors: true
});

// Function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Function to convert RGBA to CSS string
function rgbaToCSS(r: number, g: number, b: number, a: number): string {
  const rInt = Math.round(r * 255);
  const gInt = Math.round(g * 255);
  const bInt = Math.round(b * 255);
  const aRound = Math.round(a * 100) / 100;
  
  if (aRound === 1) {
    return rgbToHex(r, g, b);
  }
  return `rgba(${rInt}, ${gInt}, ${bInt}, ${aRound})`;
}

// Function to convert GradientPaint to CSS string
function gradientToCSS(paint: GradientPaint): string {
  const { gradientTransform, gradientStops, type } = paint;
  
  const stops = gradientStops.map(stop => {
    const { r, g, b, a } = stop.color;
    return `${rgbaToCSS(r, g, b, a)} ${Math.round(stop.position * 100)}%`;
  }).join(', ');

  if (type === 'GRADIENT_LINEAR') {
    const [a, c, tx] = gradientTransform[0];
    const [b, d, ty] = gradientTransform[1];
    
    const angleRad = Math.atan2(b, a);
    let angleDeg = angleRad * (180 / Math.PI) + 90;
    
    return `linear-gradient(${Math.round(angleDeg * 100) / 100}deg, ${stops})`;
  }
  
  if (type === 'GRADIENT_RADIAL') {
    return `radial-gradient(circle, ${stops})`;
  }
  
  if (type === 'GRADIENT_ANGULAR') {
    return `conic-gradient(${stops})`;
  }
  
  return `linear-gradient(${stops})`; 
}

// Interface for color data
interface ColorData {
  hex: string;
  name?: string;
  type?: 'style' | 'variable';
  isGradient?: boolean;
}

// Function to extract colors from a node
async function extractColors(node: SceneNode): Promise<ColorData[]> {
  const colors: ColorData[] = [];

  if ('fills' in node) {
    const fills = node.fills;
    
    if (fills === figma.mixed) {
       // Handle mixed fills if necessary, or skip for now
       return colors;
    }
    
    if (Array.isArray(fills)) {
      for (const fill of fills) {
        if (fill.visible === false) continue;

        let colorValue: string | undefined;
        let isGradient = false;

        if (fill.type === 'SOLID') {
          const { r, g, b } = fill.color;
          colorValue = rgbToHex(r, g, b);
        } else if (fill.type.toString().includes('GRADIENT')) {
          colorValue = gradientToCSS(fill as GradientPaint);
          isGradient = true;
        }

        if (colorValue) {
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
            hex: colorValue,
            name: colorName,
            type: colorType,
            isGradient
          });
        }
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
    // Feedback handled in UI
  } else if (msg.type === 'copy-all') {
    // Feedback handled in UI
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