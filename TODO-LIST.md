# NXvms - Master Todo List & Final Planning

## 📊 Overview
The project is currently in the **High-End UI Refinement & Core Optimization Phase**. The foundation is solid, and the premium modules for Live View, Playback, and System Health are complete. This document serves as the roadmap for the final development stages.

---

## ✅ PHASE 1: COMPLETED (CORE & UI REFINEMENT)

### 🎥 Live View & Player Pro
- [x] **Premium Video Player:** Glassmorphic UI with micro-animations and blurred overlays.
- [x] **Advanced PTZ UI:** Glassmorphic D-pad, Zoom, and real-time Preset API integration.
- [x] **Digital Zoom Engine:** Precise 8x zoom, drag-to-pan, and smart reset tooltips.
- [x] **Snapshot Hub:** High-speed capture with visual flash effect and localized auto-download.
- [x] **Camera Identity:** Dynamic status overlays (Online/Offline/Recording) and manufacturer metadata.

### 🎞️ Playback & Evidence
- [x] **VMS Timeline:** Multi-level zoom, motion/continuous segment rendering with magnetic playhead.
- [x] **Scrubbing Engine:** High-speed playback (up to 16x), precise seeking (±10s, ±1m), and "Sync to Live".
- [x] **Evidence Hub (Bookmarks):** Professional annotation hub with tagging and visual previews.
- [x] **Export Terminal:** Secure media extraction terminal with transcoding mode selection.

### 🛡️ System & Architecture
- [x] **Diagnostic Center:** Real-time infrastructure monitoring (CPU, RAM, Bandwidth, Thermals).
- [x] **Storage Topology:** Multi-disk distribution visualizer and health status mapping.
- [x] **Recording Core:** Implementation of Recording Schedules and Dual-stream modes.
- [x] **Access Control:** Unified Security Console for User/Role and Access Policies.
- [x] **Communication Hub:** Integrated Notification Flyout for system and security alerts.

---

## 🚀 PHASE 2: CORE SYSTEMS FINALIZATION (PENDING)

### 📁 Recording & Storage (Backend Internal)
- [x] **Smart Retention Polices:** Per-camera auto-deletion (FIFO) based on days or priority.
- [x] **Dynamic Disk Failover:** Logic to migrate write operations to spare disks if a primary target fails.
- [x] **Archive Integrity Audit:** Checksum verification for stored video blocks to prevent corruption silent loss.
- [x] **Expert Stream Tuning:** API for manual RTSP buffer/jitter settings and packet loss compensation.
- [x] **Configurable Storage Paths:** Environment-based configuration for recording paths (no hardcoded paths).

### 🧠 Analytics & IA Integration
- [x] **Universal AI Hub:** Unified event engine for Frigate, ONVIF, and Provision-ISR.
- [x] **Advanced Metadata Schema:** Support for LPR (License Plates), Speed, Face, and Attributes (Gender/Color).
- [ ] **ROI Architect (Region of Interest):** UI tool to draw zones for detection (Cordon, Intrusion, Loitering).
- [ ] **Object Metadata Overlay:** Logic to render real-time Bounding Boxes (Person, Vehicle, Face) using metadata.
- [ ] **Advanced Logic Rules:** "If [Condition] then [Action]" engine (e.g., Alert if Person + After Hours).
- [x] **Multi-Attribute Search:** Filter events by engine, category, severity, and rich attributes.

---

## 📺 PHASE 3: ADVANCED VMS FEATURES

### 🧱 Video Wall & Layouts
- [ ] **Grid Architect:** Flexible drag-and-drop builder for custom layouts (2x2, 1+5, 3x3, 4x4).
- [ ] **Sequential Tours:** Auto-cycle through camera groups for guard monitoring benches.
- [ ] **Multi-Head Support:** Spawn dedicated, borderless Video Wall windows for multi-monitor setups.

### 🔐 Security & Hardening
- [ ] **Encrypted Archive:** At-rest encryption for video storage blocks using AES-256.
- [ ] **The Audit Vault:** Tamper-proof system logs for user actions (Playback history, Export audit).
- [ ] **Certificate Authority:** Integrated SSL/TLS management for server-to-client communication.

---

## 🛤️ STEP-BY-STEP FINAL DEVELOPMENT PATH (RECOMMENDED ORDER)

1.  **[Current Focus] Storage Hardening:** Finalize Retention Polices and Disk Failover logic.
2.  **IA Visualization:** Connect metadata streams to the Video Player for real-time AI overlays.
3.  **Video Wall Module:** Build the grid builder and tour engine for security operations.
4.  **Complex Logic Rules:** Deploy the event-correlation engine (Advanced Rules).
5.  **Final Hardening:** Implement the Audit Vault and Encrypted Storage options.

---
*Document updated: 2026-01-09*
