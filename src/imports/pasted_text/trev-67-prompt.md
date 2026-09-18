Build **Trev 67**, a local-first AI builder for creating complete **websites, web apps, software projects, and browser games** from natural-language prompts.

The experience should feel like a simplified, polished version of **Base44/Lovable/Replit-style AI building**, but it must run locally and use the user's own Groq API key.

# ABSOLUTE REQUIREMENTS

Trev 67 must have:

* No sign up.
* No sign in.
* No accounts.
* No billing.
* No subscriptions.
* No credits.
* No platform usage limits.
* No payment system.
* No unnecessary cloud backend.
* Local projects.
* Local project persistence.
* User-owned source code.
* GitHub portability.
* One user-provided Groq API key.

The user should be able to install/run Trev 67, enter their Groq key, and immediately start building.

---

# MAIN HOME PAGE

Do NOT open directly into a code editor.

The first page should be a beautiful **project dashboard/home page**.

Think:

**"What do you want to build?"**

The home page should contain:

### Header

* Trev 67 logo.
* New Project button.
* Search projects.
* Settings.
* Theme toggle.

### Hero

Large central prompt box:

> What do you want to build?

Example suggestions:

* "Build me a multiplayer browser game"
* "Create a modern task management app"
* "Build an online store"
* "Create a 2D platformer"
* "Make a social media dashboard"
* "Build a Minecraft-style inventory UI"

The user can submit the prompt immediately.

### Project Gallery

Below the hero, show:

**Recent Projects**

Project cards should contain:

* Project name.
* Preview thumbnail.
* Project type.
* Last modified.
* Small description.
* Open button.
* More menu.

Project types:

* Website
* Web App
* Game
* Full-stack App
* Other

Include:

**Create New Project**

as a prominent card.

The gallery should feel like a real product dashboard, not a developer-only interface.

---

# PROJECT CREATION

When the user enters:

> Build me a zombie survival game

Trev 67 should actually create the project.

Do NOT just return code in chat.

The AI should:

1. Understand the request.
2. Plan the application.
3. Create the project.
4. Create the required files.
5. Install dependencies when needed.
6. Write the code.
7. Start the development server.
8. Display the live application.
9. Continue modifying it when the user asks for changes.

The user should see the AI working.

---

# BUILDER WORKSPACE

After creating/opening a project, switch to the main builder workspace.

Use a layout inspired by modern AI builders:

```text
┌───────────────────────────────────────────────────────────┐
│ Trev 67     Project Name       Preview   Publish   ...   │
├──────────────┬──────────────────────────────┬─────────────┤
│              │                              │             │
│ FILES        │       AI CHAT                │   PREVIEW   │
│              │                              │             │
│ src/         │  User: Make the menu        │             │
│ components/  │  darker                     │  LIVE APP   │
│ package.json │                              │             │
│              │  AI: I'll update...         │             │
│              │                              │             │
│              │                              │             │
├──────────────┴──────────────────────────────┴─────────────┤
│ Terminal / Build Output / Problems                         │
└───────────────────────────────────────────────────────────┘
```

Panels should be resizable.

Allow the user to switch between:

* Chat
* Preview
* Code
* Terminal
* Files

---

# AI CHAT

The chat is the primary way the user controls the builder.

Support:

* Streaming responses.
* Markdown.
* Code highlighting.
* Copy buttons.
* Regenerate.
* Stop generation.
* Retry.
* Edit message.
* New conversation.
* Clear conversation.
* File references.
* Build progress.
* Tool execution messages.
* Error messages.

The AI should explain what it is doing without flooding the user with unnecessary text.

---

# AI CODING AGENT

The AI must be an actual coding agent.

Give it tools for:

```text
list_files
read_file
write_file
edit_file
delete_file
search_files
create_directory
run_command
install_package
start_server
stop_server
get_process_output
```

The agent should inspect the existing project before making changes.

It must understand multi-file projects.

For example, if the user says:

> Make the inventory open when I press I

the AI should locate the relevant input handling, inventory component, styling, and game state rather than blindly creating a new system.

---

# WEB BUILDER

Trev 67 must build real websites.

Support:

* Landing pages.
* Portfolios.
* Dashboards.
* Stores.
* Blogs.
* Documentation sites.
* Admin panels.
* Interactive websites.
* Multi-page websites.

The AI should create real reusable components instead of putting everything into one massive HTML file.

---

# APP BUILDER

Trev 67 must be able to create complete web applications.

Examples:

* Task managers.
* Notes apps.
* Chat applications.
* Dashboards.
* CRMs.
* Productivity tools.
* Social applications.
* Booking systems.
* File managers.
* AI applications.
* Games with menus and persistence.

Support:

* React.
* Vite.
* TypeScript.
* JavaScript.
* Node.
* API routes.
* Local storage/data where appropriate.
* Common npm packages.

The architecture should remain flexible enough to support different project types.

---

# GAME BUILDER

This is extremely important.

Trev 67 must also be a **browser game builder**.

The user should be able to say:

> Make me a multiplayer survival game with zombies.

The AI should create an actual playable game.

Support projects using technologies such as:

* Canvas.
* JavaScript.
* TypeScript.
* React.
* Three.js.
* Phaser.
* Other appropriate browser game frameworks.

The AI should be capable of creating:

* Player movement.
* Cameras.
* Maps.
* Enemies.
* NPCs.
* Weapons.
* Health.
* Inventory.
* UI.
* Menus.
* Levels.
* Game states.
* Collision.
* Audio hooks.
* Multiplayer architecture where appropriate.

The preview should actually run the game.

---

# LIVE PREVIEW

The preview is one of the most important parts of Trev 67.

Show the user's real running project.

It should:

* Start automatically.
* Refresh after changes.
* Show runtime errors.
* Handle development ports.
* Support browser interaction.
* Allow opening in a new tab.
* Preserve the current preview where possible.

Do not create a fake preview image.

It must be the actual project.

---

# CODE VIEW

Include a professional code editor.

Use Monaco or another high-quality editor.

Features:

* Tabs.
* Syntax highlighting.
* Line numbers.
* Search.
* Find/replace.
* File navigation.
* Unsaved indicators.
* AI-edited indicators.
* Automatic updates when AI changes files.

The user must always have access to the actual source code.

---

# FILE SYSTEM

Display the project tree.

Example:

```text
my-game/
├── src/
│   ├── components/
│   ├── game/
│   ├── assets/
│   └── main.ts
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

Allow:

* Create file.
* Create folder.
* Rename.
* Delete.
* Search.
* Open.
* Refresh.

Never create duplicate competing versions of files.

---

# TERMINAL

Provide an integrated terminal.

The AI should be able to execute commands.

Show:

* Commands.
* Output.
* Errors.
* Exit codes.
* Running processes.
* Dev server.
* Build output.

The user should also be able to use the terminal manually.

---

# PROJECT DASHBOARD

The home screen should remember locally created projects.

Each project card should display:

```text
[Preview]

Zombie Survival
Game

Updated 12 minutes ago

Open →
```

Allow:

* Open.
* Rename.
* Duplicate.
* Delete.
* Export.
* Open folder.

Store project metadata locally.

---

# PROJECT TYPES

When creating a project, automatically determine whether it is:

**Website**
**Web App**
**Game**
**Full-stack**
**Other**

The AI can also ask only when necessary.

Do not force unnecessary setup questions.

---

# AI CONTEXT

Do NOT send the entire project to Groq every time.

Build intelligent context management.

The agent should:

1. Inspect relevant files.
2. Select only necessary files.
3. Summarize old conversations.
4. Keep recent conversation context.
5. Avoid package-lock files unless specifically needed.
6. Truncate oversized files.
7. Detect provider token limits.
8. Retry oversized requests using reduced context.

The application must never blindly send enormous prompts.

---

# GROQ

Use the user's own Groq API key.

Settings should provide:

```text
Groq API Key
Model
```

Default model:

```text
openai/gpt-oss-120b
```

Make the model configurable.

Never expose the key in generated projects.

Never commit `.env`.

Create `.env.example` where appropriate.

---

# SETTINGS

Settings should include:

### AI

* Groq API key.
* Model.
* Temperature where supported.
* Output token limit.
* Context size.

### Builder

* Auto preview.
* Auto install dependencies.
* Auto fix errors.
* Confirm destructive operations.

### Appearance

* Dark mode.
* Light mode.
* Accent color.
* Compact/comfortable layout.

No account settings.

No billing settings.

No subscription settings.

---

# GITHUB

Projects must remain completely portable.

Provide:

* Git initialization.
* Git status.
* Diff.
* Commit.
* Remote setup.
* Push when credentials are available.
* Export project.

Do not make GitHub mandatory.

A project should remain a normal folder containing normal source code.

---

# IMPORT EXISTING PROJECT

Allow users to open an existing project folder.

Trev 67 should inspect it and understand its architecture.

Do not destroy existing code.

The AI should work with existing projects as well as newly created ones.

---

# ERROR FIXING

Make error recovery a core feature.

When the project has an error:

```text
Build failed

src/App.tsx:42
Unexpected token
```

The AI should be able to:

**Fix automatically**

It should:

1. Read the error.
2. Inspect the file.
3. Identify the cause.
4. Fix it.
5. Run the build again.
6. Check whether it worked.
7. Continue until successful or explain the remaining issue.

Do not repeatedly execute the same failed command.

---

# UI STYLE

The UI should feel like a real modern product.

Not a generic admin dashboard.

Use:

* Dark-first design.
* Clean typography.
* Spacious layout.
* Subtle borders.
* Soft panels.
* Excellent empty states.
* Smooth transitions.
* Orange Trev 67 accent.
* Professional icons.
* Clear hierarchy.

Do NOT copy Base44's exact branding or interface.

Use the general interaction concept, but create an original Trev 67 design.

---

# HOME PAGE VISUAL PRIORITY

The first screen should immediately communicate:

**"Build anything."**

Example:

```text
                    Trev 67

              What do you want to build?

      ┌─────────────────────────────────────┐
      │ Describe your website, app or game… │
      │                                     │
      │                              Build ✦│
      └─────────────────────────────────────┘

       Build an app       Build a website
       Build a game       Start from scratch


                 Recent Projects

      ┌─────────────┐  ┌─────────────┐
      │   PREVIEW   │  │   PREVIEW   │
      │             │  │             │
      │ Zombie Game │  │ Task App    │
      │ Game        │  │ Web App     │
      └─────────────┘  └─────────────┘
```

The home page should NOT look like a coding IDE.

The IDE/builder workspace appears after opening a project.

---

# BUILD FLOW

The ideal experience is:

### 1. Home

User describes what they want.

### 2. AI planning

Show a concise build plan.

### 3. Building

Show live agent activity:

```text
✓ Created project
✓ Created package.json
✓ Created game engine
✓ Created player system
✓ Created UI
● Starting preview...
```

### 4. Preview

Immediately show the running project.

### 5. Iterate

User says:

> Make the zombies faster.

AI modifies the project.

Preview updates.

User says:

> Add a shop.

AI adds it.

Preview updates again.

This continuous loop is the heart of Trev 67.

---

# IMPORTANT

Do not over-engineer the first version.

Prioritize a working end-to-end loop:

**Home → Prompt → AI → Files → Run → Preview → Modify → Preview**

Everything else comes afterward.

Do not create placeholder buttons for features that don't work.

Do not fake functionality.

Do not add authentication, billing, subscriptions, credits, or accounts.

Build the actual product.

## FINAL PRODUCT

Trev 67 should feel like:

> **A personal local Base44-style AI builder for websites, web apps, and games — powered by the user's own Groq API key, with real files, real code, real terminal execution, and a real live preview.**

The user should be able to clone the repository, install dependencies, enter their Groq key, run it locally, and start building immediately.
