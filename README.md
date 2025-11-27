# Copy Hex Colors - Figma Plugin

Plugin de Figma para copiar rápidamente los valores hexadecimales de los colores de relleno (fills) de cualquier elemento.

## Características

- 🎨 Extrae automáticamente todos los colores de relleno de los elementos seleccionados
- 📋 Copia colores individuales con un solo clic
- 📝 Copia todos los colores a la vez
- 🔄 Se actualiza automáticamente al cambiar la selección
- 🎯 Incluye colores de elementos hijos
- ✨ Elimina duplicados automáticamente

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Compila el código TypeScript:
```bash
npm run build
```

3. En Figma Desktop:
   - Ve a `Plugins` → `Development` → `Import plugin from manifest...`
   - Selecciona el archivo `manifest.json` de este proyecto

## Uso

1. Abre el plugin desde `Plugins` → `Development` → `Copy Hex Colors`
2. Selecciona uno o más elementos en tu canvas de Figma
3. El plugin mostrará todos los colores de relleno encontrados
4. Haz clic en cualquier color para copiarlo individualmente
5. O usa el botón "Copy All Colors" para copiar todos los colores a la vez

## Desarrollo

Para trabajar en el plugin con recarga automática:

```bash
npm run watch
```

Esto compilará automáticamente los cambios en `code.ts` mientras desarrollas.

## Estructura de archivos

- `manifest.json` - Configuración del plugin de Figma
- `code.ts` - Código principal del plugin (lógica)
- `ui.html` - Interfaz de usuario
- `tsconfig.json` - Configuración de TypeScript
- `package.json` - Dependencias y scripts

## Notas

- Solo extrae colores sólidos (SOLID fills)
- Ignora fills invisibles o deshabilitados
- Los colores se muestran en formato hexadecimal mayúsculas (#RRGGBB)
