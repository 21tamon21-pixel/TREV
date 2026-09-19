# TREV 67 — LIVE BUILDER + PREVIEW + WORKSPACE + FUNCTIONALITY UPGRADE

This is a continuation/update to the previous Trev 67 architecture prompt.

Do NOT rebuild the application from scratch.

First inspect the current implementation and determine which features from the previous specification already exist.

Then:

* Keep working systems.
* Repair incomplete systems.
* Replace fake/placeholder functionality.
* Consolidate duplicate systems.
* Implement missing functionality.
* Test every major feature.

The goal is to make Trev 67 feel like a **real AI software-building environment**, not a landing-page generator.

---

# 1. THE MOST IMPORTANT NEW EXPERIENCE

The user should be able to start from a simple prompt:

> "Build me a multiplayer browser survival game with a lobby, inventory and enemies."

They press:

**Build**

The UI should then smoothly transform into the actual builder workspace.

Do NOT simply navigate to a completely unrelated page.

The transition should feel like:

```text
HOME
  ↓
USER PROMPT
  ↓
BUILD STARTS
  ↓
CHAT MOVES TO SIDEBAR
  ↓
PROJECT WORKSPACE APPEARS
  ↓
LIVE PREVIEW STARTS
```

The original request should remain visible.

---

# 2. PROMPT-TO-BUILDER TRANSITION

Before building:

```text
┌──────────────────────────────────────────────┐
│                  Trev 67                     │
│                                              │
│ What do you want to build?                   │
│                                              │
│ [ Build me a multiplayer browser game... ]   │
│                                              │
│                 [ Build ]                    │
└──────────────────────────────────────────────┘
```

After clicking Build:

The interface transitions into:

```text
┌──────────────────────────────────────────────────────────┐
│ Trev 67   Project Name       Model       Preview ↗       │
├──────────┬─────────────────────────────────┬──────────────┤
│ Files    │                                 │              │
│          │       LIVE PREVIEW              │   AI CHAT    │
│ src/     │                                 │              │
│ public/  │       [running app]             │              │
│ package  │                                 │   Building   │
│          │                                 │   project... │
├──────────┴─────────────────────────────────┴──────────────┤
│ Terminal / Problems / Git / Build Output                   │
└───────────────────────────────────────────────────────────┘
```

---

# 3. CHAT BECOMES A SIDEBAR

The AI chat should not dominate the entire application after building starts.

The chat should become a resizable sidebar.

Example:

```text
┌─────────────────────────────┬─────────────────────────────┐
│                             │ AI                          │
│                             │                             │
│        PREVIEW              │ Building your app...        │
│                             │                             │
│                             │ ✓ Created project           │
│                             │ ✓ Created package.json      │
│                             │ ● Building game world       │
│                             │ ○ Adding player movement    │
│                             │ ○ Starting preview          │
│                             │                             │
│                             │ [message composer]          │
└─────────────────────────────┴─────────────────────────────┘
```

The sidebar must be:

* Resizable
* Collapsible
* Expandable
* Scrollable
* Persistent during builds

---

# 4. CHAT COLLAPSE

Add a button:

```text
Hide Chat
```

When collapsed:

```text
┌─────────────────────────────────────────────────────────┐
│                         PREVIEW                          │
│                                                         │
│                                                         │
│                                      [AI ▸]              │
└─────────────────────────────────────────────────────────┘
```

Clicking `[AI ▸]` restores the chat.

---

# 5. CHAT EXPAND

Allow the user to temporarily expand the AI panel.

Modes:

```text
Compact
Normal
Expanded
Fullscreen
```

---

# 6. LIVE BUILD STATUS

The AI chat should show exactly what the agent is doing.

Example:

```text
Building your project

✓ Analyzed request
✓ Selected React + Vite
✓ Created project structure
✓ Created 14 files
● Installing dependencies
○ Starting development server
○ Running tests
```

Do NOT fake progress.

Every status should correspond to an actual operation.

---

# 7. TOOL ACTIVITY

Show actual AI tool operations.

For example:

```text
AI is working

▾ File operations

✓ Created src/App.tsx
✓ Created src/components/Game.tsx
✓ Edited src/styles.css

▾ Terminal

$ npm install
✓ completed

● npm run dev
```

Allow collapsing each section.

---

# 8. LIVE PREVIEW DURING BUILDING

This is extremely important.

The preview should not wait until the entire project is finished.

As soon as the project can run:

```text
START DEV SERVER
↓
PREVIEW LOADS
↓
AI CONTINUES BUILDING
```

If the app is incomplete, show the current version.

Example:

```text
Building...

Preview currently shows:
✓ Basic layout
✓ Navigation
✓ Main screen

Still being added:
○ Authentication
○ Dashboard
○ Settings
```

The preview updates as files change.

---

# 9. PREVIEW LOADING STATE

Before the application can run:

```text
┌─────────────────────────────┐
│                             │
│       Preparing preview     │
│                             │
│       ◌ Starting server     │
│                             │
│       Installing packages   │
│                             │
└─────────────────────────────┘
```

Do not use a fake infinite spinner.

Show the actual operation.

---

# 10. PREVIEW ERROR STATE

If the preview fails:

```text
┌─────────────────────────────┐
│ Preview failed              │
│                             │
│ TypeError: ...              │
│                             │
│ [Fix with AI]               │
│ [View Error]                │
│ [Restart Preview]           │
└─────────────────────────────┘
```

Clicking **Fix with AI** should send the real error and relevant files to the coding agent.

---

# 11. PREVIEW REFRESH

Add:

```text
↻ Refresh
```

But prefer automatic updates.

Support:

```text
Hot reload
Fast refresh
Full reload
```

depending on the framework.

---

# 12. OPEN PREVIEW IN NEW TAB

Add:

**Open Preview ↗**

This should open the actual running preview URL in another browser tab.

Example:

```text
http://localhost:5173
```

or the appropriate forwarded Codespaces URL.

Do NOT create a fake preview tab.

---

# 13. PREVIEW URL

Show the actual URL:

```text
Preview

● Running

localhost:5173

[Open ↗] [Copy URL]
```

If running in Codespaces, detect the appropriate forwarded/preview URL where possible.

---

# 14. PREVIEW MODES

Support:

```text
Embedded
New Tab
Fullscreen
```

The user can choose their preferred mode.

Remember the preference.

---

# 15. RESPONSIVE PREVIEW

Add viewport controls:

```text
Desktop
Tablet
Mobile
```

Optional custom width/height.

Example:

```text
Desktop 1440 × 900
Tablet 768 × 1024
Mobile 390 × 844
```

The preview should actually resize.

---

# 16. PREVIEW DEVICE FRAME

Optional setting:

```text
Show device frame
```

Do not make it visually huge.

---

# 17. SPLIT PREVIEW

Allow:

```text
50 / 50
60 / 40
70 / 30
```

between preview and chat.

Dragging the divider should resize both.

---

# 18. PREVIEW-ONLY MODE

Add:

**Preview Only**

This hides:

* Files
* Chat
* Terminal

and gives the project maximum screen space.

Escape returns to the builder.

---

# 19. CODE + PREVIEW MODE

Allow a mode:

```text
Code | Preview
```

or:

```text
Code + Preview
```

Example:

```text
┌──────────────────────┬──────────────────────┐
│ CODE                 │ PREVIEW              │
│                      │                      │
│ App.tsx              │ running application  │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

---

# 20. AI FOCUSING

When the AI edits a file:

Automatically open or highlight that file.

Example:

```text
AI editing:

src/components/Player.tsx
```

The editor should jump to the relevant location.

Do not constantly steal focus from the user if they are manually editing another file.

---

# 21. LIVE CHANGE INDICATORS

When AI changes files:

Show:

```text
App.tsx    ●
styles.css ●
game.ts    ●
```

with a subtle unsaved/AI-change indicator.

---

# 22. AI CHANGE DIFF

Clicking an AI-modified file should allow:

```text
View Changes
```

Show a proper diff.

Example:

```text
+ added
- removed
```

Actions:

```text
Accept
Revert
```

For autonomous builds, changes can be automatically applied while remaining reversible.

---

# 23. BUILD TIMELINE

Create a small build timeline.

Example:

```text
Build timeline

09:42  Started
09:42  Project analyzed
09:43  Files created
09:44  Dependencies installed
09:44  Preview started
09:45  Runtime issue detected
09:45  Fix applied
09:46  Build complete
```

Only use actual timestamps/events.

---

# 24. BUILD INTERRUPTIONS

If the user sends another message while the AI is working:

Example:

> "Actually make the player blue."

The agent should understand this as an update to the current build.

Do not create a completely separate project.

---

# 25. BUILD QUEUE

If the user sends several requests:

```text
Current task
Add multiplayer

Queued
Add inventory
Add enemies
Add settings
```

Allow the user to:

* Reorder
* Cancel
* Pause
* Run now

---

# 26. BUILD PAUSE

Add:

```text
Pause
```

The agent stops after its current safe operation.

Then:

```text
Resume
```

continues.

---

# 27. BUILD STOP

Add:

```text
Stop
```

Safely terminate:

* AI generation
* Running tool call
* Build process where possible

Do not corrupt files.

---

# 28. AUTO-RECOVERY

If the AI crashes during a build:

```text
Build interrupted

Recovering previous state...
```

Use the current project files and continue from there.

Do not restart from scratch.

---

# 29. BUILD CHECKPOINTS

Automatically create internal checkpoints:

```text
Checkpoint 1
Project initialized

Checkpoint 2
Core UI complete

Checkpoint 3
Preview working
```

These should not clutter the project directory.

---

# 30. "WHAT'S HAPPENING?" PANEL

Add a small expandable panel:

```text
What is the AI doing?

Currently:
Editing src/game/player.ts

Reason:
Adding player movement requested in your prompt.

Next:
Run TypeScript check.
```

This makes the AI feel transparent without overwhelming the user.

---

# 31. CURRENT AI TASK

At the top of chat:

```text
● Building

Adding player movement
```

When complete:

```text
✓ Ready

Player movement added.
```

---

# 32. AI THINKING DISPLAY

Do NOT expose private chain-of-thought.

Instead show concise action summaries:

```text
Analyzing project...
Checking existing player system...
Planning changes...
Editing files...
Testing...
```

Never display hidden reasoning.

---

# 33. STREAMING CHAT

AI responses must stream naturally.

Show:

```text
Building...
```

while work happens.

Do not freeze the entire UI during AI requests.

The preview must remain interactive when possible.

---

# 34. INTERACTIVE PREVIEW DURING BUILD

If the application already runs:

The user should be able to interact with it while the AI continues working.

For example:

```text
AI is adding inventory...

Preview is currently usable.
```

Do not unnecessarily block the preview.

---

# 35. BUILD COMPLETE

When complete:

```text
✓ Build complete

Your project is ready.

18 files changed
2 dependencies added
0 errors
0 warnings

Preview is running.

[Open Preview ↗]
[View Changes]
[Continue Building]
```

---

# 36. BUILD PARTIALLY COMPLETE

If the AI cannot finish everything:

Do not pretend it finished.

Show:

```text
Build paused

Completed:
✓ Project setup
✓ Main interface
✓ Preview

Remaining:
○ Database integration

Reason:
Database credentials are required.
```

Then provide:

```text
[Continue]
[Configure Environment]
```

---

# 37. USER REQUEST BAR

The chat composer should always allow:

```text
Make changes...
```

Examples:

> Make the sidebar smaller.

> Add a settings page.

> Make the game harder.

> Fix this error.

> Change the color to orange.

> Add multiplayer.

The AI should modify the existing project rather than rebuilding it.

---

# 38. QUICK ACTIONS

Under the composer:

```text
Build
Fix
Explain
Improve
Test
Run
```

Selecting an action should provide context to the agent.

---

# 39. ATTACHMENT SUPPORT

Allow attaching:

* Images
* Screenshots
* Files
* Logs

Example:

```text
Fix this UI
[attached screenshot]
```

The AI should use the actual attachment.

---

# 40. SCREENSHOT PREVIEW

Add:

**Capture Preview**

The user can send the current preview screenshot to the AI.

Example:

```text
Look at this UI and improve the spacing.
```

The AI receives the screenshot and relevant project context.

---

# 41. UI INSPECT MODE

Add optional:

**Inspect Preview**

User clicks an element in the preview.

Show:

```text
Element
Button

File
src/components/Button.tsx

Class
.primary-button
```

Then:

```text
Ask AI to modify
```

This would be extremely useful for visual editing without turning Trev 67 into a fake visual builder.

---

# 42. PREVIEW ERROR AUTO-DETECTION

Monitor:

* Console
* Runtime exceptions
* Failed network requests
* Build errors

If an error appears:

```text
⚠ Preview error detected

TypeError in Player.tsx

[Fix with AI]
```

---

# 43. NETWORK INSPECTOR

For full-stack applications:

Show:

```text
Request
GET /api/users

Status
200

Time
84ms
```

Useful for debugging.

---

# 44. BUILD PERFORMANCE

Show:

```text
Build time
Dependencies
Bundle size
```

where the project tooling provides this information.

---

# 45. MOBILE RESPONSIVENESS

The builder UI itself must work on smaller screens.

On narrow screens:

```text
Files → drawer
Chat → drawer
Preview → main area
Terminal → bottom sheet
```

Do not simply squash all panels together.

---

# 46. PROJECT TAB SYSTEM

Allow multiple open files:

```text
App.tsx
Player.tsx
styles.css
package.json
```

Close tabs.

Restore tabs when reopening the project.

---

# 47. MULTI-PROJECT WORKSPACE

Allow opening multiple projects.

Do not mix project files or processes.

Each project needs:

```text
isolated path
isolated preview
isolated process state
isolated AI context
```

---

# 48. PROJECT SWITCHER

Top bar:

```text
Trev 67
↓
Projects
  My Game
  Portfolio
  Dashboard
```

Switching projects should safely stop/reuse processes as appropriate.

---

# 49. GITHUB WORKSPACE

Add a Git indicator:

```text
main
● 3 changes
```

Clicking it opens Git.

Show:

```text
Modified
Added
Deleted
Untracked
```

---

# 50. ONE-CLICK COMMIT

Allow:

```text
Commit AI changes
```

Generate a useful commit message automatically.

Example:

```text
Add player movement and collision
```

But let the user edit it before committing.

---

# 51. GITHUB PUSH SAFETY

Before push:

```text
Checking repository...

✓ No API keys detected
✓ .env ignored
✓ Build passes
✓ Changes ready
```

If secrets are detected:

```text
⚠ Possible secret detected

File:
.env

Action:
Remove from commit
```

Never silently push secrets.

---

# 52. PROJECT EXPORT

Add:

```text
Export Project
```

Options:

```text
Download ZIP
Open Folder
GitHub
```

The ZIP should contain only the actual project.

Never include:

* API keys
* Trev internal state
* cached provider credentials
* unnecessary build caches

---

# 53. PROJECT CLONING

After importing a GitHub project:

Trev 67 should automatically:

```text
Detect project
Install dependencies
Find dev command
Start preview
Open builder
```

---

# 54. PROVIDER-AWARE BUILDING

The AI agent must know which provider/model it is using.

Display:

```text
Building with

Groq
Model: ...
```

or:

```text
Building with

VEX
Model: VEX Prime
```

---

# 55. MODEL SWITCHING WHILE PROJECT IS OPEN

The user can switch:

```text
Groq → VEX
```

without restarting the project.

Only future AI requests use the new provider unless the user explicitly retries an existing request.

---

# 56. VEX LIVE STATUS

If VEX is selected:

```text
VEX
● Connected
Model: VEX Prime
```

If disconnected:

```text
VEX
○ Not configured
[Configure]
```

---

# 57. VEX BRAIN DEVELOPMENT MODE

Create an advanced developer page:

```text
VEX Brain
```

Show:

```text
Brain
Models
Routing
Tools
Memory
Context
Requests
Logs
API Keys
```

Allow testing VEX independently from Trev 67.

---

# 58. VEX REQUEST PLAYGROUND

Create:

```text
VEX Playground
```

User can enter:

```text
Model
System prompt
User prompt
Temperature
Max output
Tools
Streaming
```

Then:

```text
[Run]
```

Show:

```text
Request
Response
Latency
Usage
Provider route
```

This becomes our development environment for the VEX brain.

---

# 59. VEX MODEL ROUTING LOG

When VEX routes a request:

```text
Request
↓
VEX Router
↓
Task classification
↓
Selected model
↓
Provider
↓
Response
```

Show this only in developer/debug mode.

---

# 60. VEX FALLBACK

If VEX's primary model fails:

```text
Primary provider failed
↓
VEX selecting fallback
↓
Fallback request
```

Only if fallback is configured.

---

# 61. VEX BRAIN VERSIONING

Allow:

```text
Brain v0.1
Brain v0.2
Brain v0.3
```

The developer can create a new version before changing production behavior.

---

# 62. VEX API DOCUMENTATION

Generate local API docs for:

```text
/v1/chat/completions
/v1/models
/v1/health
/v1/embeddings
/v1/agents
```

Use OpenAPI where appropriate.

---

# 63. OPENAPI SUPPORT

If a generated project contains an OpenAPI specification:

Automatically detect it.

Show:

```text
API
Endpoints
Schemas
Try request
```

---

# 64. REAL FUNCTIONALITY RULE

Every feature added in this upgrade must pass:

```text
UI exists
↓
Backend exists
↓
Real operation occurs
↓
Result displayed
↓
Error handled
↓
Test completed
```

A button that only changes UI state is NOT considered implemented.

---

# 65. NO FAKE BUILDING

Never display:

```text
✓ Created 20 files
```

unless 20 files were actually created.

Never display:

```text
✓ Tests passed
```

unless tests actually ran.

Never display:

```text
✓ Preview ready
```

unless the preview server is actually running.

Never display:

```text
✓ GitHub exported
```

unless the repository was actually exported/pushed.

---

# 66. AUTOMATIC TEST SUITE

After implementing this upgrade, test:

## UI

* Home
* Prompt
* Builder
* Chat sidebar
* Preview
* New tab preview
* Fullscreen
* Resizing
* Mobile layout

## AI

* Streaming
* Tool calls
* File editing
* Build progress
* Error recovery
* Model switching

## Providers

* Provider selection
* API key configuration
* Test connection
* Model discovery
* Invalid key
* Invalid model
* Rate limits
* Provider switching

## Preview

* Start
* Stop
* Restart
* Refresh
* Hot reload
* New tab
* Runtime errors

## Git

* Init
* Status
* Commit
* Branch
* Export
* Secret scanning

## VEX

* API connection
* Key validation
* Model list
* Chat request
* Streaming
* Brain configuration
* Routing
* Logs

---

# 67. PERFORMANCE REQUIREMENT

Do not make the builder sluggish.

AI operations must not freeze:

* Preview
* Editor
* Terminal
* File tree
* UI

Use asynchronous processes and streaming.

---

# 68. FINAL EXPERIENCE

The finished workflow should feel like:

```text
Trev 67 Home
      ↓
"What do you want to build?"
      ↓
User enters prompt
      ↓
Build
      ↓
Workspace opens
      ↓
AI chat moves to sidebar
      ↓
AI explains what it is doing
      ↓
Files are created
      ↓
Dependencies install
      ↓
Preview starts as soon as possible
      ↓
User watches the app develop live
      ↓
Preview updates during construction
      ↓
Errors appear immediately
      ↓
AI fixes them
      ↓
Build completes
      ↓
User can continue chatting
      ↓
User can open preview in another tab
      ↓
User can inspect code
      ↓
User can test
      ↓
User can commit
      ↓
User can export to GitHub
```

---

# 69. FINAL COMMAND

Before changing code:

**AUDIT THE CURRENT PROJECT FIRST.**

Identify:

* What already works
* What partially works
* What is fake
* What is duplicated
* What is broken
* What is missing

Then implement the highest-value missing functionality.

Do not throw away working architecture.

Do not create duplicate provider systems.

Do not create duplicate preview systems.

Do not create duplicate project systems.

Do not leave placeholder buttons.

Do not mark a feature complete until it has been tested.

The final product must be a **real, portable, local AI development environment capable of building real websites, web apps, full-stack applications, and browser games**, with a live AI coding agent, live preview, multi-provider AI, Git/GitHub integration, and the beginnings of the VEX AI platform.
