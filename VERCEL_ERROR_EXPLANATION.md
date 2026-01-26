# Comprehensive Guide: DEPLOYMENT_NOT_FOUND Error

## 1. The Fix

### What I Changed
Created `vercel.json` in the project root to configure Vercel for your monorepo structure:

```json
{
  "version": 2,
  "buildCommand": "cd web && npm ci && npm run build",
  "outputDirectory": "web/build",
  "installCommand": "cd web && npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Why This Works
- **buildCommand**: Tells Vercel to navigate to `web` directory before building
- **outputDirectory**: Points to where Create React App outputs (`web/build`)
- **installCommand**: Ensures dependencies install in the correct location
- **rewrites**: Handles React Router's client-side routing (SPA routing)

---

## 2. Root Cause Analysis

### What Was Happening vs. What Should Happen

**What Vercel Was Doing (Wrong):**
1. Looking for `package.json` in the root directory (`servy-admin/`)
2. Trying to run `npm install` in the root
3. Looking for build output in root or default locations
4. Not finding a deployment because the React app structure didn't match expectations

**What Should Happen:**
1. Recognize that the React app is in a subdirectory (`web/`)
2. Install dependencies from `web/package.json`
3. Run build command from `web/` directory
4. Find build output in `web/build/`
5. Serve the built files correctly

### Conditions That Triggered This Error

1. **Monorepo Structure**: Your project has the React app in a subdirectory (`web/`), not at the root
2. **No Vercel Configuration**: Without `vercel.json`, Vercel uses default assumptions (root-level app)
3. **Default Detection Failed**: Vercel's auto-detection couldn't find the framework because:
   - `package.json` wasn't at root
   - Build scripts weren't in the expected location
   - Framework detection looks for specific file patterns at root

### The Misconception

**Common Assumption**: "Vercel will automatically detect my React app wherever it is"

**Reality**: Vercel's auto-detection works well for:
- Single-app repositories (app at root)
- Well-known frameworks at root
- Standard project structures

**Your Case**: Monorepo structure requires explicit configuration because:
- The framework detection algorithm checks root-level files first
- Build commands need to know where to run
- Output directories need explicit paths

---

## 3. Understanding the Concept

### Why This Error Exists

**Purpose**: The `DEPLOYMENT_NOT_FOUND` error protects you from:
1. **Silent Failures**: Prevents deploying broken/incomplete builds
2. **Resource Waste**: Avoids creating deployments that won't work
3. **Security**: Ensures only valid, buildable projects get deployed
4. **Cost Control**: Prevents billing for failed deployments

### The Mental Model

Think of Vercel deployment as a **3-stage pipeline**:

```
1. DISCOVERY → Find the app and its framework
   ↓
2. BUILD → Install deps, compile, optimize
   ↓
3. DEPLOY → Upload and serve the output
```

**Your Error**: Stage 1 (Discovery) failed because:
- Vercel looked in the wrong place (root instead of `web/`)
- Couldn't identify the framework
- Couldn't find build configuration

**The Fix**: Explicitly tell Vercel:
- Where to look (`web/` directory)
- What to build (`npm run build`)
- Where output is (`web/build/`)

### How This Fits Into Framework Design

**Vercel's Philosophy**:
- **Convention over Configuration**: Defaults work for 80% of cases
- **Explicit Configuration**: When conventions don't fit, use config files
- **Framework-Aware**: Understands React, Next.js, Vue, etc.

**Monorepo Support**:
- Vercel supports monorepos but requires configuration
- Each app in a monorepo can have its own settings
- Root-level `vercel.json` can configure the entire repo
- Or use per-project configuration

---

## 4. Warning Signs & Prevention

### Red Flags to Watch For

1. **Project Structure Mismatch**
   - ✅ **Good**: App at root, standard structure
   - ⚠️ **Warning**: App in subdirectory, non-standard layout
   - **Action**: Create `vercel.json` immediately

2. **Build Scripts Location**
   - ✅ **Good**: `package.json` at root with build script
   - ⚠️ **Warning**: `package.json` in subdirectory
   - **Action**: Configure `buildCommand` to navigate to subdirectory

3. **Framework Detection**
   - ✅ **Good**: Vercel auto-detects framework
   - ⚠️ **Warning**: "Framework not detected" in logs
   - **Action**: Explicitly set `framework` in `vercel.json`

4. **Deployment Errors**
   - ⚠️ **Early Warning**: "Build command not found"
   - ⚠️ **Early Warning**: "Output directory not found"
   - 🚨 **Error**: `DEPLOYMENT_NOT_FOUND`
   - **Action**: Check build logs, verify paths

### Similar Mistakes to Avoid

1. **Wrong Output Directory**
   ```json
   // ❌ Wrong
   "outputDirectory": "build"
   
   // ✅ Correct (for your structure)
   "outputDirectory": "web/build"
   ```

2. **Missing Path Navigation**
   ```json
   // ❌ Wrong
   "buildCommand": "npm run build"
   
   // ✅ Correct
   "buildCommand": "cd web && npm run build"
   ```

3. **Incorrect Install Command**
   ```json
   // ❌ Wrong (installs in root)
   "installCommand": "npm install"
   
   // ✅ Correct
   "installCommand": "cd web && npm install"
   ```

4. **Missing SPA Routing**
   ```json
   // ❌ Missing (React Router won't work)
   {}
   
   // ✅ Correct (handles client-side routing)
   "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   ```

### Code Smells & Patterns

**Pattern 1: Monorepo Without Config**
```
servy-admin/
├── web/          ← App here
│   ├── package.json
│   └── src/
└── (no vercel.json)  ← Missing!
```
**Fix**: Add `vercel.json` at root

**Pattern 2: Multiple Apps, One Config**
```
monorepo/
├── admin/        ← App 1
├── web/          ← App 2
└── vercel.json   ← Which app?
```
**Fix**: Use Vercel's monorepo features or separate projects

**Pattern 3: Build Output Mismatch**
```
vercel.json says: "outputDirectory": "dist"
Actual output:    "web/build"
```
**Fix**: Match the actual build output location

---

## 5. Alternative Approaches & Trade-offs

### Approach 1: Root-Level vercel.json (Current Solution)
**Pros**:
- ✅ Single configuration file
- ✅ Works for single-app monorepos
- ✅ Easy to maintain
- ✅ Version controlled

**Cons**:
- ⚠️ Only works if you have one deployable app
- ⚠️ Less flexible for multiple apps

**Best For**: Your current setup (one React app in `web/`)

---

### Approach 2: Move App to Root
**Structure**:
```
servy-admin/
├── package.json  ← Move here
├── src/
└── public/
```

**Pros**:
- ✅ No configuration needed
- ✅ Standard structure
- ✅ Works with auto-detection

**Cons**:
- ❌ Requires restructuring existing code
- ❌ May break local development setup
- ❌ Loses monorepo benefits

**Best For**: Single-app projects, new projects

---

### Approach 3: Vercel Project Settings (Dashboard)
**Method**: Configure in Vercel Dashboard instead of `vercel.json`

**Pros**:
- ✅ No config file needed
- ✅ Easy to change without commits
- ✅ Per-environment settings

**Cons**:
- ❌ Not version controlled
- ❌ Harder to replicate across environments
- ❌ Team members might miss settings

**Best For**: Quick fixes, temporary configurations

---

### Approach 4: Vercel Monorepo Support
**Method**: Use Vercel's built-in monorepo features

**Structure**:
```
servy-admin/
├── web/
│   └── vercel.json  ← Per-app config
└── .vercelignore
```

**Pros**:
- ✅ Scales to multiple apps
- ✅ Per-app configuration
- ✅ Better for large teams

**Cons**:
- ⚠️ More complex setup
- ⚠️ Requires understanding monorepo patterns

**Best For**: Multiple deployable apps, large teams

---

### Approach 5: Build Script Wrapper
**Method**: Create a root-level build script

**package.json** (root):
```json
{
  "scripts": {
    "build": "cd web && npm run build"
  }
}
```

**Pros**:
- ✅ Works with auto-detection
- ✅ Can add pre/post build steps

**Cons**:
- ⚠️ Still need `outputDirectory` config
- ⚠️ Requires root `package.json`

**Best For**: When you want to keep auto-detection

---

## Recommended Solution for Your Project

**Current Fix (vercel.json) is Best Because**:
1. ✅ No code restructuring needed
2. ✅ Explicit and clear
3. ✅ Version controlled
4. ✅ Works immediately
5. ✅ Handles React Router correctly

**Next Steps**:
1. Commit `vercel.json` to your repository
2. Push to your Git provider
3. Deploy via Vercel (it will read the config)
4. Verify deployment works
5. Test React Router navigation

---

## Quick Reference

### When to Use Each Approach

| Scenario | Best Approach |
|----------|-------------|
| Single app in subdirectory | `vercel.json` (current) |
| Single app at root | Auto-detection (no config) |
| Multiple apps | Monorepo config per app |
| Quick test | Dashboard settings |
| Need build hooks | Root build script + config |

### Key Takeaways

1. **Monorepos need explicit configuration** - Vercel can't always auto-detect
2. **Paths matter** - Build commands and output directories must match your structure
3. **SPA routing needs rewrites** - React Router requires special handling
4. **Version control your config** - `vercel.json` should be in Git
5. **Test locally first** - Run `npm run build` in `web/` to verify it works

---

## Additional Resources

- [Vercel Configuration Reference](https://vercel.com/docs/project-configuration)
- [Monorepo Deployment Guide](https://vercel.com/docs/monorepos)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

