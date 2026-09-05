# BlockNote Integration — Todo Application

## 1. Project Overview

The Todo application currently allows users to create tasks with a simple title and description.

We want to improve the task description experience by replacing the basic description input with **BlockNote**, a block-based rich-text editor.

This will allow users to create more detailed and structured task descriptions using headings, lists, checklists, code blocks, formatting, and other rich-text features.

---

## 2. Current Problem

The current task description uses a simple text input.

```text
Task Title
Task Description
```

This works for short descriptions but becomes difficult when a user needs to explain a complex task.

For example:

```text
Build authentication system with login,
signup, validation, error handling, and
password reset.
```

There is no structure or formatting.

---

## 3. Proposed Solution

Replace the existing description input with a **BlockNote editor**.
 
The new task creation experience will look conceptually like:

```text
┌──────────────────────────────────────┐
│ Task Title                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Describe your task...                │
│                                      │
│ Type "/" for commands                │
│                                      │
└──────────────────────────────────────┘

              [ Create Task ]
```

Users can then create structured descriptions such as:

```text
# Authentication System

Implement authentication for the application.

## Requirements

- Login
- Signup
- Logout
- Password validation
- Password reset

## Notes

Authentication should be secure and
properly handle errors.
```

---

# 4. Why BlockNote?

BlockNote provides a better writing experience than a normal textarea or input.

### Features we can use

* Rich text formatting
* Headings
* Bullet lists
* Numbered lists
* Checklists
* Code blocks
* Links
* Text formatting
* Block-based content
* Slash commands
* Structured document data

This makes it suitable for detailed Todo descriptions.

---

# 5. Technology

The editor will use:

```text
BlockNote
├── @blocknote/core
├── @blocknote/react
└── @blocknote/mantine
```

Mantine dependencies:

```text
@mantine/core
@mantine/hooks
@mantine/utils
```

---

# 6. Installation

Install the required packages:

```bash
npm install @blocknote/core @blocknote/react @blocknote/mantine @mantine/core @mantine/hooks @mantine/utils
```

---

# 7. Next.js Integration

BlockNote is a client-side editor, so it should not be rendered directly as a Server Component.

We will create a separate editor component.

Recommended structure:

```text
components/
├── Editor.tsx
└── DynamicEditor.tsx
```

---

# 8. Create Editor Component

Create:

```text
components/Editor.tsx
```

Implementation:

```tsx
"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor() {
  const editor = useCreateBlockNote();

  return <BlockNoteView editor={editor} />;
}
```

### Important

The following line is required:

```tsx
"use client";
```

This tells Next.js that the editor must run on the client.

---

# 9. Dynamic Import

Create:

```text
components/DynamicEditor.tsx
```

Implementation:

```tsx
"use client";

import dynamic from "next/dynamic";

export const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
});
```

The important configuration is:

```tsx
ssr: false
```

This prevents Next.js from trying to render BlockNote on the server.

---

# 10. Use Editor in Todo Form

The Todo form will import the dynamic editor:

```tsx
import { Editor } from "@/components/DynamicEditor";
```

Then replace the existing description input:

```tsx
<input
  type="text"
  placeholder="Task description"
/>
```

with:

```tsx
<Editor />
```

The Todo form will now contain:

```text
Todo Form
│
├── Task Title
│
├── BlockNote Editor
│
└── Create Task Button
```

---

# 11. Managing Editor Content

BlockNote stores content as structured blocks instead of a simple string.

The editor document can be accessed using:

```tsx
editor.document
```

For example:

```tsx
const content = editor.document;
```

The content can then be sent to the backend when creating or updating a Todo.

---

# 12. Create Todo Flow

The expected flow is:

```text
User
 │
 │ writes task
 ↓
BlockNote Editor
 │
 │ editor.document
 ↓
Todo Form
 │
 │ submit
 ↓
API
 │
 ↓
Database
```

Example:

```tsx
const content = editor.document;

await createTodo({
  title,
  description: content,
});
```

---

# 13. Edit Todo Flow

When the user opens an existing Todo:

```text
Database
   │
   ↓
Saved Description
   │
   ↓
BlockNote Editor
   │
   ↓
User edits content
   │
   ↓
Updated Document
   │
   ↓
API
   │
   ↓
Database
```

The editor should initialize with the existing task description.

---

# 14. Data Storage

Instead of storing:

```json
{
  "title": "Build authentication",
  "description": "Create login and signup"
}
```

we will store the BlockNote document as structured content.

Conceptually:

```json
{
  "title": "Build authentication",
  "description": [
    {
      "type": "paragraph",
      "content": "Implement authentication"
    },
    {
      "type": "bulletListItem",
      "content": "Create login"
    },
    {
      "type": "bulletListItem",
      "content": "Create signup"
    }
  ]
}
```

The exact database format will be finalized during implementation based on the serialization format used by BlockNote.

---

# 15. Component Architecture

```text
Todo Application
│
├── TodoForm
│    │
│    ├── Task Title
│    │
│    └── DynamicEditor
│          │
│          └── Editor
│                │
│                └── BlockNote
│
├── Create Todo API
│
├── Update Todo API
│
└── Database
```

---

# 16. Implementation Plan

### Step 1 — Install dependencies

Install BlockNote and Mantine packages.

### Step 2 — Create editor

Create `Editor.tsx` as a Client Component.

### Step 3 — Disable SSR

Create `DynamicEditor.tsx` using `next/dynamic`.

### Step 4 — Integrate with Todo form

Replace the existing description input with BlockNote.

### Step 5 — Manage editor state

Capture the editor document when the user submits the form.

### Step 6 — Update API

Send the structured description to the Todo API.

### Step 7 — Update database

Store the BlockNote document.

### Step 8 — Implement editing

Load the saved document when editing a Todo.

### Step 9 — Render saved content

Display formatted BlockNote content when viewing a Todo.

---

# 17. Expected Result

After implementation, users will be able to create Todos with detailed descriptions instead of plain text.

### Before

```text
Task:
Build authentication

Description:
Create login and signup.
```

### After

```text
Task:
Build authentication

Description:

# Authentication

Implement authentication for the application.

## Tasks

☐ Create login
☐ Create signup
☐ Add validation
☐ Add logout

## Notes

Handle authentication errors properly.
```

---

# 18. Future Improvements

Once the basic BlockNote integration is complete, we can consider:

* Markdown support
* Image support
* File attachments
* Mentions
* Custom blocks
* Task-specific checklists
* Collaboration
* Autosave
* Version history
* Rich Todo rendering
* AI-powered task summarization
* AI-powered task breakdown

---

# 19. Final Goal

The goal is to transform the Todo description from a **simple text field** into a **structured task documentation editor**.

```text
Simple Todo
     ↓
Title + Text Description

             ↓

Improved Todo
     ↓
Title + Rich Task Documentation
     ↓
BlockNote
     ↓
Structured Content
     ↓
Better Task Management
```

The first implementation should focus on getting the **basic BlockNote editor working inside the Todo create/edit form** before adding advanced features.
