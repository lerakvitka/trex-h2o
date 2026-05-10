# Pixel T-Rex Hydration

_Started 2026-05-10 17:09 UTC_

---

## User

I want to create a little cute pixel art app for my boyfriend. it will be drink water reminder. i want there a hero - green t-rex and it should do interact a bit every 30 minutes to give a reminder to drink water.

## Assistant

_[tool: list_files]_

_[tool: questions_v2]_

## User

Questions answered:
- interactions: Hold up a water cup
- idle_behavior: Look around curiously
- reminder_intensity: Subtle — gentle bounce, no sound
- tracking: Daily goal (e.g. 8 glasses)
- messages: drink you water; not drinking water - that's what killed  us; pie had his water, now it's you turn; make me proud - drink water 
- interval_tweak: Yes — let him pick (15/30/45/60 min)
- extras: Little house/scene around the T-Rex (grass, sun, clouds), Confetti when daily goal hit, Different T-Rex outfits/hats to unlock
- test_mode: Yes — add a button to trigger reminder instantly for testing

## Assistant

_[tool: update_todos]_

Got it! Let me plan and build this. I'll fill in some defaults you didn't pick (cozy warm pastel palette, classic plump pixel T-Rex, desktop window size).

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: done]_

_[tool: snip]_

_[tool: run_script]_

_[tool: done]_

_[tool: run_script]_

_[tool: snip]_

_[tool: done]_

_[tool: grep]_

_[tool: snip]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Your T-Rex water reminder app is ready! Here's what's in there:

🦖 **The little guy** — a green pixel T-Rex who lives in a cozy sunny scene (sun, clouds drift by, hills, a little house, flowers). He breathes, looks around curiously, and has a tiny blush.

💧 **Reminders every 30 min** (adjustable: 15/30/45/60 in settings) — he gently bounces, holds up a water cup, and shows a speech bubble with one of your messages: *"drink you water"*, *"not drinking water — that's what killed us"*, *"pie had his water, now it's you turn"*, *"make me proud — drink water"*.

📊 **8-glass tracker** — click the big button or any glass slot. Confetti rains when he hits goal.

🎩 **6 hats to unlock** by drinking water over time (party hat free, top hat at 10, wizard at 40, etc.) — wardrobe button bottom right.

🧪 **TEST button** triggers a reminder instantly. Tap the T-Rex himself to poke him too.

State persists in localStorage and resets daily.

**Things to know / tweak ideas:**
- The 4 messages cycle randomly — easy to add more in the `MESSAGES` array
- Hat unlock thresholds (5/10/20/40) are quick to retune if too stingy
- Want sound, day/night cycle, or a mobile-sized version next? Just say the word

