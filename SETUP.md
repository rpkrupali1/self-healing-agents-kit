# Workshop setup

This page has three parts:

| Part | Who | When |
|---|---|---|
| **A. Quick check** | Everyone | First minute in the room |
| **B. Set up the kit** | Everyone | In the room, ~5 minutes |
| **C. Catch-up** | Only if you skipped the setup guide that was emailed before the workshop, or Part A fails | Before Part B, ~20 minutes |

Stuck at any point? Pair with a neighbour, or ask for the browser-only option.

---

## Part A — Quick check (1 min)

You did these with the setup guide that was emailed before the workshop. Check they still work:

| Check | ✅ You should see | If not |
|---|---|---|
| `node --version` | `v20` or higher | Part C1 |
| `git --version` | `git version 2.x` | Part C1 |
| Your AI tool replies to `say hello` | A reply | Part C2 |

All three fine? Go to Part B.

---

## Part B — Set up the kit (5 min)

### B1. Get the kit

In your terminal, run these **one at a time, in order**:

| # | Run this | ✅ You should see |
|---|---|---|
| 1 | `git clone https://github.com/rpkrupali1/self-healing-agents-kit.git` | A new folder `self-healing-agents-kit` is created |
| 2 | `cd self-healing-agents-kit` | Your prompt now ends in `self-healing-agents-kit` |
| 3 | `npm install` | Ends with `added … packages`. Warnings are fine; errors are not |
| 4 | `npx playwright install chromium` | Download progress bars, then the prompt returns. If you did the setup email, Chromium is already cached and this finishes in seconds |

**Windows: if you see** *"npm.ps1 cannot be loaded because running scripts is disabled on this system"*, Windows is blocking `npm`. Fix it once (no admin rights needed; it changes only your own account):

1. In PowerShell, run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
2. Answer **Y** if asked, then close PowerShell, open a new one, and run the command again.
3. If it says the setting is *overridden by a policy* (common on company laptops), use **Command Prompt** (`cmd`) instead of PowerShell for the `npm` and `npx` commands.

### B2. Check your setup

```bash
npm run verify
```

✅ You should see **5 × PASS**: Node.js, Git, Playwright, Chromium, and the sample app. If any line says **FAIL**, it tells you the command that fixes it.

### B3. Install Playwright's test agents for your AI tool

Playwright's planner, generator and healer agents must be installed inside the kit, so this step is only possible now. In the kit folder, run the **one** line for your tool:

| Your tool | Run this | ✅ Then |
|---|---|---|
| Claude Code | `npx playwright init-agents --loop=claude` | New files in `.claude/agents/`. Restart Claude Code if it was open |
| VS Code + Copilot | `npx playwright init-agents --loop=vscode` | New files under `.github/`. Reload VS Code: **Ctrl+Shift+P → Developer: Reload Window** |
| Codex | `npx playwright init-agents --loop=codex` | New agent files appear |
| opencode | `npx playwright init-agents --loop=opencode` | New agent files appear |

> The agent files depend on your Playwright version. If you upgrade Playwright later, run the line again.

### B4. Open the kit in your AI tool

- **Claude Code (terminal):** in the kit folder, run `claude`.
- **VS Code (Claude Code extension or Copilot):** **File → Open Folder…**, and pick the kit folder.
- **Codex / opencode:** in the kit folder, run `codex` or `opencode`.

**Optional, if you installed the Playwright extension:** click the **Testing** icon (🧪) in VS Code's left sidebar, then ▶ next to `seed` under `tests/ui`. It turns green.

### ✅ Ready

- [ ] `npm run verify` shows 5 × PASS
- [ ] I ran the `init-agents` line for my tool
- [ ] My AI tool is open in the kit folder

Now open [labs/](labs/README.md) and start Lab 1.

---

## Part C — Catch-up: if you skipped the emailed setup guide

These are the same steps as the setup guide that was emailed before the workshop. Do them, then go back to Part B.

### C1. Install the basics

| Tool | Get it from | Check it works | ✅ Expected result |
|---|---|---|---|
| Laptop (Windows, Mac or Linux), 8 GB RAM, Chrome or Edge | — | Open Chrome or Edge | The browser opens |
| **Node.js 20 or newer** | https://nodejs.org (LTS) | `node --version` | `v20` or higher, e.g. `v24.19.0` |
| **Git** | https://git-scm.com | `git --version` | `git version 2.x`, e.g. `git version 2.47.0` |
| **VS Code** (or your preferred editor) | https://code.visualstudio.com | `code --version` | First line is a version number, e.g. `1.105.0`. For Copilot (Option B), it must be **1.105 or higher** |
| **A free GitHub account** | https://github.com/signup | Sign in at https://github.com | You see your GitHub dashboard |

Run the commands in a terminal: **PowerShell** on Windows, **Terminal** on Mac or Linux.

If a command says *"not recognized"* or *"command not found"*, the tool isn't installed, or the terminal was open before you installed it. Close the terminal, open a new one, and try again.

### C2. Set up ONE AI agent tool

Pick **one**. Everything in the workshop works with all four.

#### Option A — Claude Code *(the instructor's setup)*
Needs a Claude Pro plan or higher, or API billing. Use it in the **terminal** (A1) **or** inside **VS Code** (A2). Both work the same in the workshop.

**A1. Claude Code in the terminal**
1. Install it:
   - **Windows** (PowerShell):
     ```powershell
     irm https://claude.ai/install.ps1 | iex
     ```
   - **Mac / Linux** (Terminal):
     ```bash
     curl -fsSL https://claude.ai/install.sh | bash
     ```
   ✅ Expected: `Claude Code successfully installed!`. Full guide: https://docs.claude.com/en/docs/claude-code/setup

2. **Check that `claude` is on your PATH.** Open a **new** terminal and run:
   ```bash
   claude --version
   ```
   ✅ Expected: a version number, e.g. `2.1.291 (Claude Code)`.

   ❌ If you get *"not recognized"* / *"command not found"*, or the installer said *"…\.local\bin is not in your PATH"*, add the folder to your PATH:

   **Windows.** No admin rights are needed; this changes only your own user PATH. Pick one method:
   - **Settings method:**
     1. Press the **Windows key**, type **environment variables**, and open **"Edit environment variables for your account"**.
     2. Under **User variables**, select **Path**, then click **Edit…** → **New**.
     3. Paste `%USERPROFILE%\.local\bin`, then click **OK** → **OK**.
   - **PowerShell method:** paste this one line:
     ```powershell
     [Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\.local\bin", "User")
     ```

   **Mac / Linux:** add the folder to your shell profile:
   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc     # Mac default shell; use ~/.bashrc on most Linux
   ```

   Then **close every terminal** (and VS Code, if it's open), open a new one, and run `claude --version` again.

3. Run `claude` and sign in when asked.
4. Check: type `say hello` and press Enter. You should get a reply. Type `/exit` to leave.

**A2. Claude Code inside VS Code**
1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac).
2. In the search box, type the extension ID `anthropic.claude-code`. Install **Claude Code**, published by **Anthropic** (with a verified ✓).
3. Click the **Claude** icon (the spark ✱) in the sidebar or the editor's top-right corner, and sign in when asked.
4. Check: type `say hello`. You should get a reply.

#### Option B — VS Code + GitHub Copilot *(free option)*
Needs VS Code 1.105 or newer. Copilot Free is enough.
1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac). In the search box, type the extension ID `GitHub.copilot-chat`. Install **GitHub Copilot Chat**, published by **GitHub** (with a verified ✓). Don't install the older **GitHub Copilot** extension (`GitHub.copilot`): it's deprecated, and Copilot Chat now includes everything. Searching just "copilot" also shows lookalikes from other publishers; don't install those.
2. Sign in with your GitHub account when prompted, and turn on **Copilot Free** if asked.
3. Open the Chat view (**Ctrl+Alt+I**, or **⌃⌘I** on Mac). Below the chat box, set the mode dropdown to **Agent**. Leave the button next to it on **Auto**, optimized for **Balance**. You don't need to choose a model.
4. Check: type `say hello`. You should get a reply.

#### Option C — Codex
Needs a ChatGPT plan that includes Codex, or an OpenAI API key.
1. Install it, following https://developers.openai.com/codex/cli
2. Run `codex` and sign in.
3. Check: type `say hello`. You should get a reply. Then exit Codex.

#### Option D — opencode *(open source; free models available)*
1. Install it, following https://opencode.ai/docs
2. Run `opencode` and connect a model provider, following its prompts.
3. Check: type `say hello`. You should get a reply. Then exit opencode.

### C3. Install the Playwright extension for VS Code (recommended)

It lets you run a test with one click and watch it in a real browser. This is handy for reviewing what the agents write.

1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac).
2. In the search box, type the extension ID `ms-playwright.playwright`. Install **Playwright Test for VS Code**, published by **Microsoft** (with a verified ✓).

### Corporate laptop?

Check that npm installs and your AI tool aren't blocked by company policy. If they are, use a personal laptop, or the browser-only option.
