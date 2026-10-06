# Setup

**Did the pre-workshop setup email?** Then Step 1 is done, and your AI tool is already working. In the room you only need:
1. **Step 2:** get the kit
2. **Step 3:** run `npm run verify`
3. **Step 4:** run the one `init-agents` line for your tool

That takes about 5 minutes. **Starting from scratch?** Do every step, which takes about 20 minutes.

Stuck? Pair with a neighbour, or ask for the browser-only option.

---

## Step 1 — Install the basics

| Tool | Get it from | Check it works | ✅ Expected result |
|---|---|---|---|
| Laptop (Windows, Mac or Linux), 8 GB RAM, Chrome or Edge | — | Open Chrome or Edge | The browser opens |
| **Node.js 20 or newer** | https://nodejs.org (LTS) | `node --version` | `v20` or higher, e.g. `v24.19.0` |
| **Git** | https://git-scm.com | `git --version` | `git version 2.x`, e.g. `git version 2.47.0` |
| **VS Code** (or your preferred editor) | https://code.visualstudio.com | `code --version` | First line is a version number, e.g. `1.105.0`. For Copilot (Option B), it must be **1.105 or higher** |
| **A free GitHub account** | https://github.com/signup | Sign in at https://github.com | You see your GitHub dashboard |

Run the commands in a terminal: **PowerShell** on Windows, **Terminal** on Mac or Linux.

If a command says *"not recognized"* or *"command not found"*, the tool isn't installed, or the terminal was open before you installed it. Close the terminal, open a new one, and try again.

## Step 2 — Get the kit

```bash
git clone <kit repo URL>
cd self-healing-agents-kit
npm install
npx playwright install chromium
```

`npx playwright install chromium` is the big download (~150 MB). If you did the setup email, Chromium is already cached and this finishes in seconds.

| Command | ✅ Expected result |
|---|---|
| `git clone …` | A new folder `self-healing-agents-kit` is created |
| `npm install` | Ends with `added … packages`. Warnings are fine; errors are not |
| `npx playwright install chromium` | Download progress bars, then the prompt returns with no error. If Chromium is already installed, it finishes straight away with no output |

## Step 3 — Check your setup

```bash
npm run verify
```

✅ You should see **5 × PASS**: Node.js, Git, Playwright, Chromium, and the sample app.

If any line says **FAIL**, it tells you the command that fixes it.

## Step 4 — Set up ONE AI agent tool

Pick **one**. Everything in the workshop works with all four. Each option ends by installing **Playwright's test agents** (planner, generator, healer) for that tool.

> **Already set up your tool from the email?** Skip to the `init-agents` line at the end of your option.

### Option A — Claude Code *(the instructor's setup)*
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

3. In the kit folder, run `claude` and sign in when asked.
4. Check: type `say hello` and press Enter. You should get a reply. Type `/exit` to leave.

**A2. Claude Code inside VS Code**
1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac).
2. Search for **Claude Code**, and install the one published by **Anthropic**.
3. Open the kit folder: **File → Open Folder…**
4. Click the **Claude** icon (the spark ✱) in the sidebar or the editor's top-right corner, and sign in when asked.
5. Check: type `say hello`. You should get a reply.

**Then, for A1 or A2**, install Playwright's agents. In a terminal in the kit folder (in VS Code: **Terminal → New Terminal**), run:
```bash
npx playwright init-agents --loop=claude
```
✅ New files appear in `.claude/agents/`. If Claude Code was already open, restart it so it picks them up.

### Option B — VS Code + GitHub Copilot *(free option)*
Needs VS Code 1.105 or newer. Copilot Free is enough.
1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac), and install **GitHub Copilot**. It includes Copilot Chat.
2. Sign in with your GitHub account when prompted, and turn on **Copilot Free** if asked.
3. Open the kit folder: **File → Open Folder…**
4. Open the Chat view (**Ctrl+Alt+I**, or **⌃⌘I** on Mac). Set the mode dropdown to **Agent**.
5. Check: type `say hello`. You should get a reply.
6. Install Playwright's agents. Open **Terminal → New Terminal** and run:
   ```bash
   npx playwright init-agents --loop=vscode
   ```
   ✅ New agent files appear under `.github/`. Reload VS Code (**Ctrl+Shift+P → Developer: Reload Window**) so Copilot picks them up.

### Option C — Codex
Needs a ChatGPT plan that includes Codex, or an OpenAI API key.
1. Install it, following https://developers.openai.com/codex/cli
2. In the kit folder, run `codex` and sign in.
3. Check: type `say hello`. You should get a reply. Then exit Codex.
4. Install Playwright's agents. In the kit folder, run:
   ```bash
   npx playwright init-agents --loop=codex
   ```

### Option D — opencode *(open source; free models available)*
1. Install it, following https://opencode.ai/docs
2. In the kit folder, run `opencode` and connect a model provider, following its prompts.
3. Check: type `say hello`. You should get a reply. Then exit opencode.
4. Install Playwright's agents. In the kit folder, run:
   ```bash
   npx playwright init-agents --loop=opencode
   ```

> The agent files depend on your Playwright version. If you upgrade Playwright later, run the `init-agents` line again.

## Step 5 — Install the Playwright extension for VS Code (recommended)

It lets you run a test with one click and watch it in a real browser. This is handy for reviewing what the agents write.

1. In VS Code, open the Extensions view (**Ctrl+Shift+X**, or **⇧⌘X** on Mac).
2. Search for **Playwright Test for VS Code**, and install the one published by **Microsoft**.
3. Open the kit folder, then click the **Testing** icon (the flask 🧪) in the left sidebar.
4. Check: you should see the kit's tests listed. Click ▶ next to `seed` under `tests/ui`. It turns green.

**No Playwright or API-testing experience is needed.** The agents write the code, and you get step-by-step instructions and prompts on the day. If you've read a test before (Playwright, Selenium, anything), you'll review the agents' output a bit faster. That's all.

---

## Corporate laptop?

Check that npm installs and your AI tool aren't blocked by company policy. If they are, use a personal laptop, or plan to use the browser-only option on the day.

## Ready checklist

- [ ] `npm run verify` shows 5 × PASS
- [ ] My AI tool replies to `say hello` in the kit folder
- [ ] I ran `npx playwright init-agents` for my tool
- [ ] (Recommended) The Playwright extension shows the kit's tests in VS Code
