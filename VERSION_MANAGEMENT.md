# Version Management Guide

## Overview

NXvms uses semantic versioning (MAJOR.MINOR.PATCH) following the standard format: **v0.1.0**

The version is:
- Stored in `.version` file (single source of truth)
- Automatically updated in `package.json` files
- Displayed in the UI (login screen + application sidebar)
- Used for Git tags and releases

## Current Version

📦 **v0.1.0** - Initial release (January 8, 2026)

The version is displayed:
1. **Login Screen** - Below the NXvms logo
2. **Application Sidebar** - At the bottom of the left sidebar

## Updating Version

### Automatic Update (Recommended)

#### Windows
```powershell
.\scripts\update-version.bat 0.2.0
```

#### macOS / Linux
```bash
./scripts/update-version.sh 0.2.0
```

This automatically updates:
- `.version` file
- `client/package.json`
- `server/package.json` (if available)

### Manual Update

If the scripts fail, update manually:

1. Update `.version` file:
```
0.2.0
```

2. Update `client/package.json`:
```json
{
  "version": "0.2.0"
}
```

3. Update `server/package.json` (if available):
```json
{
  "version": "0.2.0"
}
```

## Committing Version Changes

After updating the version, commit and tag:

```bash
# Stage changes
git add .

# Commit with version message
git commit -m "chore: release v0.2.0"

# Create annotated tag
git tag -a v0.2.0 -m "Release version 0.2.0"

# Push commits and tags
git push origin main --tags
```

Or in one command:
```bash
git add . && git commit -m "chore: release v0.2.0" && git tag -a v0.2.0 -m "Release version 0.2.0" && git push origin main --tags
```

## Version Display in UI

The version is automatically injected during the build process via Vite configuration:

### Login Screen
```tsx
<h1>NXvms</h1>
<p>Video Management System</p>
<VersionBadge />  {/* Shows v0.1.0 */}
```

### Application Sidebar
```tsx
<aside>
  <ResourceTree />
  <div className="border-t border-dark-700 p-4">
    <VersionBadge className="text-center" />
  </div>
</aside>
```

### Version Component
Located in `client/src/shared/version-badge.tsx`:
```tsx
export const VersionBadge: React.FC = () => {
  const version = getVersionBadge();
  return <div>{version}</div>;
};
```

## Development Build

The version is set at build time from the `.version` file:

```typescript
// vite.config.ts
const version = fs.readFileSync(path.resolve(__dirname, '../.version'), 'utf-8').trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
```

## Git Workflow

### Release Workflow

1. **Update version**
   ```bash
   ./scripts/update-version.bat 0.2.0
   ```

2. **Verify changes**
   ```bash
   git diff
   git status
   ```

3. **Commit and tag**
   ```bash
   git add .
   git commit -m "chore: release v0.2.0"
   git tag -a v0.2.0 -m "Release version 0.2.0"
   ```

4. **Push to GitHub**
   ```bash
   git push origin main --tags
   ```

### GitHub Release

Once tagged, create a release on GitHub:

1. Go to [Releases](https://github.com/jdolan-exalink/nxvms/releases)
2. Click "Create a new release"
3. Select the tag (v0.2.0)
4. Fill in title and description
5. Publish release

## Version Format

Follow semantic versioning:

- **MAJOR** - Breaking changes (e.g., v1.0.0)
- **MINOR** - New features (e.g., v0.2.0)
- **PATCH** - Bug fixes (e.g., v0.1.1)

Examples:
- `0.1.0` - Initial release
- `0.2.0` - Add new features
- `0.2.1` - Bug fix
- `1.0.0` - Production ready

## Changelog

### v0.1.0 (January 8, 2026)
**Initial Release**
- ✅ Live view with multi-protocol support
- ✅ PTZ controls and digital zoom
- ✅ Snapshot functionality
- ✅ Playback with timeline and frame stepping
- ✅ Smart search with advanced filtering
- ✅ Bookmarks with tags and notes
- ✅ Export progress tracking
- ✅ Health monitoring
- ✅ Notifications system
- ✅ User and role management

## Environment Variables

For CI/CD pipelines, the version can be injected via environment:

```bash
VITE_APP_VERSION=0.2.0 npm run build
```

Or in `.env`:
```
VITE_APP_VERSION=0.2.0
```

## Troubleshooting

### Version not updating in UI
- Clear browser cache
- Rebuild: `npm run build`
- Check `.version` file is readable
- Verify Vite config reads `.version`

### Version script fails
- Run manually with `npm version` command
- Ensure you're in the correct directory
- Check file permissions

### Tag already exists
```bash
git tag -d v0.2.0                    # Delete local tag
git push origin --delete v0.2.0      # Delete remote tag
git tag -a v0.2.0 -m "Description"  # Recreate tag
git push origin v0.2.0               # Push new tag
```

## Best Practices

1. ✅ **Always use semantic versioning**
2. ✅ **Tag every release in Git**
3. ✅ **Update CHANGELOG with each release**
4. ✅ **Test before releasing**
5. ✅ **Keep `.version` and `package.json` in sync**
6. ✅ **Announce releases on GitHub**
7. ✅ **Use descriptive commit messages**

## References

- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
