# 📦 Version Display Preview

## How the Version Appears in NXvms

### 1. Login Screen (Below Logo)

```
┌─────────────────────────────────┐
│                                 │
│           [LOGO]                │
│                                 │
│            NXvms                │
│   Video Management System       │
│           v0.1.0                │  ← Version Badge
│                                 │
│   ┌───────────────────────────┐ │
│   │ Sign In                   │ │
│   │                           │ │
│   │ Server URL: [......]      │ │
│   │ Username: [......]        │ │
│   │ Password: [......]        │ │
│   │                           │ │
│   │     [Sign In Button]      │ │
│   └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Component Code:**
```tsx
<div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
    <svg>...</svg>
  </div>
  <h1 className="text-3xl font-bold text-white mb-2">NXvms</h1>
  <p className="text-dark-400 mb-3">Video Management System</p>
  <VersionBadge />  {/* ← Shows v0.1.0 */}
</div>
```

### 2. Application Sidebar (Bottom)

```
┌──────────────────────────────────┬─────────────────┐
│                                  │                 │
│  NXvms                           │                 │
│  ├─ Site A                       │                 │
│  │ ├─ Server 1                   │                 │
│  │ │ ├─ Camera 1                 │                 │
│  │ │ └─ Camera 2                 │ Main Content    │
│  │ └─ Server 2                   │                 │
│  └─ Site B                       │                 │
│                                  │                 │
│ ─────────────────────────────── │                 │
│          v0.1.0                  │                 │
│ ─────────────────────────────── │                 │
│                                  │                 │
└──────────────────────────────────┴─────────────────┘
```

**Component Code:**
```tsx
<aside className="flex flex-col">
  <div className="flex-1 overflow-hidden">
    <ResourceTree />
  </div>
  <div className="border-t border-dark-700 p-4">
    <VersionBadge className="text-center" />
  </div>
</aside>
```

## Version Component

### File: `src/shared/version-badge.tsx`

```tsx
import React from 'react';
import { getVersionBadge } from './version';

export const VersionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const version = getVersionBadge();

  return (
    <div className={`flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 ${className}`}>
      {version}
    </div>
  );
};
```

### File: `src/shared/version.ts`

```tsx
export const getVersion = (): string => {
  // Try to get version from import.meta.env (Vite environment variables)
  const envVersion = import.meta.env.VITE_APP_VERSION;
  if (envVersion) {
    return envVersion;
  }

  // Fallback to package.json version
  return __APP_VERSION__;
};

export const getVersionBadge = (): string => {
  return `v${getVersion()}`;
};
```

## How It Works

### Build Time (Vite)
```typescript
// vite.config.ts
import fs from 'fs';

const version = fs.readFileSync(path.resolve(__dirname, '../.version'), 'utf-8').trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  // ... rest of config
});
```

### Runtime
```
.version file (0.1.0)
        ↓
    Read at build
        ↓
    Injected as __APP_VERSION__
        ↓
    Used by getVersion()
        ↓
    Displayed in VersionBadge component
```

## Styling

The version badge is styled with:
- **Font**: Small (text-xs), Semibold
- **Color**: Gray-500 (light mode), Gray-400 (dark mode)
- **Alignment**: Center
- **Appearance**: Subtle, non-intrusive

```tsx
<div className="flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
  v0.1.0
</div>
```

## Visual Example

### Login Screen
![Login Screen with Version](docs/login-version-preview.png)
```
╔═══════════════════════════════════╗
║                                   ║
║              📹                   ║
║                                   ║
║              NXvms                ║
║       Video Management System     ║
║             v0.1.0                ║
║                                   ║
║       ┌─────────────────────────┐ ║
║       │ Sign In                 │ ║
║       │                         │ ║
║       │ Server URL: [        ] │ ║
║       │ Username:   [        ] │ ║
║       │ Password:   [        ] │ ║
║       │                         │ ║
║       │  [Sign In] [Register]   │ ║
║       └─────────────────────────┘ ║
│                                   │
╚═══════════════════════════════════╝
```

### Application Sidebar
![Sidebar with Version](docs/sidebar-version-preview.png)
```
┌────────────────────────────┐
│  📹 NXvms                  │
├────────────────────────────┤
│ Resources                  │
│ ├ Site A                   │
│ │ ├ Server 1               │
│ │ │ ├ Camera 1             │
│ │ │ ├ Camera 2             │
│ │ │ └ Camera 3             │
│ │ └ Server 2               │
│ └ Site B                   │
│                            │
├────────────────────────────┤
│      v0.1.0                │
└────────────────────────────┘
```

## Updating Version Text

When you update to v0.2.0, just run:

```powershell
.\scripts\update-version.bat 0.2.0
```

Then:
1. The `.version` file updates to `0.2.0`
2. The badge automatically shows `v0.2.0`
3. No code changes needed!

## Accessibility

The version badge is:
- ✅ Screen reader friendly (text content)
- ✅ Color contrast compliant (gray-400 text)
- ✅ Semantic HTML (`<div>` with text)
- ✅ Keyboard accessible
- ✅ No interactive elements (read-only)

## Dark Theme Support

The version badge automatically adapts to dark mode:

```tsx
text-gray-500 dark:text-gray-400
  ↓
Light mode: Gray-500
Dark mode: Gray-400
```

This matches the UI color scheme perfectly:
- **Light Mode**: Darker gray text on light background
- **Dark Mode**: Lighter gray text on dark background (current)

## Development vs Production

### Development
- Version read from `.version` file
- Hot reload updates version if changed

### Production  
- Version embedded at build time
- Can't change without rebuild
- Ensures version consistency

## Browser DevTools

Check the version in browser console:
```javascript
console.log(__APP_VERSION__)  // "0.1.0"
```

Or inspect component:
```javascript
import { getVersion } from '@/shared/version';
console.log(getVersion())  // "0.1.0"
```

---

**This version display system ensures that:**
- ✅ The version is always visible to users
- ✅ Updates are automatic with the update script
- ✅ No manual UI changes needed
- ✅ Build-time injection guarantees accuracy
- ✅ Professional appearance throughout the application
