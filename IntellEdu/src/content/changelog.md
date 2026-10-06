# IntellEdu Platform Changelog v2.4 ⚡

### 🌟 New Features & Enhancements

* **Performance Mode Switch (High Graphics ↔ Normal UI)**
  * Instant toggling between rich ambient gradients and ultra-fast flat design for low bandwidth connections.
  * Preserves user performance state across sessions via `localStorage`.

* **Multilingual UI Support**
  * Switch between **English**, **ગુજરાતી (Gujarati)**, and **हिंदी (Hindi)** seamlessly in the top navbar.

* **Markdown Lesson Viewer Pipeline**
  * Full support for GitHub Flavored Markdown (`remark-gfm`), code syntax highlighting, task lists, and quotes.

* **Gamified Student Dashboard**
  * Real-time streak tracking, XP points badges, horizontally scrollable progress cards, and live leaderboard widget.

---

```javascript
// IntellEdu System Release Config
export const SystemInfo = {
  version: "2.4.0",
  mode: "Hybrid AI Tutor",
  supportedLocales: ["en", "gu", "hi"],
  performanceToggles: ["High Graphics", "Normal UI Mode"]
};
```

