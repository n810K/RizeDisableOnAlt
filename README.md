# Title Cleaner for Memex & Rize

## Overview
This browser extension resolves title conflicts between Memex and Rize on Windows systems. When both extensions are installed, Rize can modify page titles by appending URL information, which affects how Memex saves bookmarks. This extension ensures clean, proper titles are saved in Memex without URL appendages.

## Features
- Temporarily disables Rize when hovering over the Memex ribbon or pressing Alt. 
- Automatically cleans page titles by removing appended URLs

## How to Use
1. Install the extension

## Installation
1. Clone this repository or download the files
2. Open Chrome/Chromium Browser and go to extensions management
3. Enable Developer Mode
4. Click "Load unpacked extension"
5. Select the folder containing these files

## Requirements
- Memex extension installed
- Rize extension installed

## Technical Details
The extension works by:
- Monitoring Alt key presses
- Temporarily disabling Rize when needed
- Cleaning page titles by removing URL appendages
- Re-enabling Rize after Memex ribbon is closed or Alt key is released. 

## Disclaimer
This is an unofficial extension and is not affiliated with either Memex or Rize. 