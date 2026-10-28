# TabFlow Privacy Policy

Last updated: October 28, 2026

TabFlow is a browser extension for Chrome and Opera that organizes, searches, archives and saves your open tabs. This policy describes what TabFlow does with information on your device.

## Summary

TabFlow keeps everything it stores on your own device, in your browser's local extension storage. It has no servers, no accounts, no analytics and no advertising. It does not send your data anywhere.

## Information TabFlow handles

To do its job, TabFlow reads information about your open tabs through the browser's extension APIs:

- **Tab details:** the URL, page title, favicon address, pinned and audio state, window, and tab group of each open tab.
- **Tab activity times:** when each tab was last active, so that idle tabs can be archived after the time you choose. Entries older than 24 hours are deleted automatically, and an entry is removed when its tab closes.
- **Page word count:** on regular web pages (http and https), a small script counts the words on the page to estimate reading time. Only the page address and the estimated minutes go to the extension's background process. The page text is not stored, and the estimate is held in memory only.
- **Recently closed tabs:** in the Opera panel and the side panel, TabFlow reads the browser's recently closed list so you can reopen tabs from it. It does not store that list.

## Information TabFlow stores

TabFlow saves the following in `chrome.storage.local` on your device:

- **Archived tabs:** URL, title, favicon address, domain, archive time, group name, window, and estimated reading time. Up to 500 entries.
- **Saved sessions:** sets of tabs (URL, title, favicon address, pinned state, position and group name) that you save, plus automatic snapshots and an automatic "last session" record if those features are on. Up to 50 sessions.
- **Tab notes** you write, keyed by page URL.
- **Domain rules** you set (always or never archive a domain).
- **Settings** such as the archive timer, duplicate detection, grouping and theme.
- **Tab activity times,** as described above.

This data does not sync across devices, because TabFlow uses local storage, not sync storage.

## What TabFlow does with tabs

Depending on your settings and actions, TabFlow can close tabs (after archiving them, when it detects a duplicate, or in Focus mode), discard tabs from memory, open tabs and windows, and create or update tab groups. All of this happens in your browser.

## Sharing and transfer

TabFlow makes no network requests of its own. It does not sell, share or transfer your data to anyone. It does not use your data for advertising, credit decisions or any purpose unrelated to managing your tabs.

Your browser loads favicon images from the addresses the browser reports for each tab, the same way it does in its own tab strip.

## Export and import

You can export your archived tabs and saved sessions to a JSON file you download. You choose where that file goes. Importing reads a file you select and adds its sessions.

## Deleting your data

You can delete archived tabs, sessions and notes inside TabFlow. Removing the extension deletes everything it stored.

## Changes

If this policy changes, the updated version will be posted at this address with a new date.

## Contact

jackgierlich@gmail.com
