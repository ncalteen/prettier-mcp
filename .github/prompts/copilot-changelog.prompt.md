---
mode: agent
tools: [fetch]
description: Fetch and Summarize Copilot Changelog
---

- Fetch Copilot changes from `https://github.blog/changelog/?label=copilot`
  using the `fetch` tool.
- Get additional context from the RSS feed `https://github.blog/changelog/feed`
  to help summarize the Copilot changes, but don't include feed items not in the
  Copilot changes.
- List posts in order returned by the feed.

Summarize Copilot changes in a concise manner. Include the date of the change
and a brief description of the update. If there are multiple updates, list them
in bullet points. If there are no updates, respond with "No updates found."
Response should be in Markdown format, and include well-formatted bullet lists
with urls and summaries of each change.

Include the date of the change, but don't group by day, just list all changes in
the order they appear in the feed. Try and include at least 5 changes, but don't
include minimal impact ones.

Example:

```markdown
- <date of post> - [<summary of title>](url)
  - Agent mode is now in public preview (enabled via settings)
  - Model Context Protocol (MCP) support added for accessing structured tools
    and resources
  - Next Edit Suggestions (NES) feature now available to predict edits
    throughout files
  - New Copilot Consumptions panel for quota management in Pro SKU
  - Integrated pull request code review experience
```
