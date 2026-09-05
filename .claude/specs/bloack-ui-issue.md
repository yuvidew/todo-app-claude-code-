# BlockNote Todo Editor — Sheet UI & Overflow Fix

## 1. Overview

The BlockNote editor is now integrated into the Todo application and is working correctly.

The next improvement is to enhance the task creation and editing experience.

There are two main UI changes:

1. Fix the BlockNote editor overflow issue when users enter large or long content.
2. Replace the existing centered Dialog with a right-side Shadcn Sheet.

The Sheet should support:

* Create Task
* View Task
* Edit Task

When the user clicks a task card, the Sheet should open from the right and display the complete BlockNote document.

---

## 2. Current Problem

The current UI uses a centered Dialog for creating and editing tasks.

There is also an overflow issue when the user enters long or unbroken content into the BlockNote editor.

For example:

```
```

```
thsjahdfkjbasdfkbsdkfbksdgksdghksd...
```

This content can extend outside the editor/container.

The content should instead wrap inside the available width.

---

## 3. Proposed Solution

Replace the existing Dialog with a Shadcn Sheet.

The Sheet should open from the right side:

```
```

```
<SheetContent side="right">
```

The Sheet will become the main interface for task management.

It should support three modes:

```
```

```
Create
View
Edit
```

---

## 4. Install Shadcn Sheet

Run:

```
```

```
npx shadcn@latest add sheet
```

If installing manually:

```
```

```
npm install @base-ui/react
```

The component should be available at:

```
```

```
components/ui/sheet.tsx
```

---

## 5. Sheet Imports

Use:

```
```

```
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
```

Basic structure:

```
```

```
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent
    side="right"
    className="flex h-full flex-col"
  >
    <SheetHeader>
      <SheetTitle>Task Details</SheetTitle>

      <SheetDescription>
        View and manage your task.
      </SheetDescription>
    </SheetHeader>

    {/* Task content */}

    <SheetFooter>
      {/* Actions */}
    </SheetFooter>
  </SheetContent>
</Sheet>
```

---

# 6. Sheet Modes

Use a single `TaskSheet` component with three modes:

```
```

```
type TaskSheetMode = "create" | "view" | "edit";
```

### Create Mode

Used when the user clicks:

```
```

```
+ Create Task
```

The Sheet opens with an empty task form.

### View Mode

Used when the user clicks an existing task card.

The Sheet opens and displays the complete task document.

### Edit Mode

Used when the user clicks the Edit button inside the Sheet.

The existing task becomes editable.

---

# 7. Sheet State

Maintain the following state:

```
```

```
const [sheetOpen, setSheetOpen] = useState(false);

const [selectedTask, setSelectedTask] =
  useState<Task | null>(null);

const [sheetMode, setSheetMode] =
  useState<"create" | "view" | "edit">("create");
```

The state works like this:

```
```

```
sheetOpen
├── true
└── false

selectedTask
├── null → Create
└── Task → View/Edit

sheetMode
├── create
├── view
└── edit
```

---

# 8. Create Task

When the user clicks Create Task:

```
```

```
const handleCreateTask = () => {
  setSelectedTask(null);
  setSheetMode("create");
  setSheetOpen(true);
};
```

The Sheet should display:

```
```

```
Create New Task

Title
[________________________]

Assignee
[________________________]

Description

[ BlockNote Editor ]

              [Cancel] [Create Task]
```

---

# 9. Open Sheet from Task Card

Every task card should be clickable.

```
```

```
const handleTaskClick = (task: Task) => {
  setSelectedTask(task);
  setSheetMode("view");
  setSheetOpen(true);
};
```

Then:

```
```

```
<div onClick={() => handleTaskClick(task)}>
  <TaskCard task={task} />
</div>
```

The flow becomes:

```
```

```
User clicks Task Card
        ↓
selectedTask = task
        ↓
sheetMode = "view"
        ↓
sheetOpen = true
        ↓
Right Sheet opens
        ↓
Task document displayed
```

---

# 10. View Task

In View mode, the Sheet should display the saved BlockNote document.

The user should be able to read the complete task description.

Example:

```
```

```
Task Details

Build Authentication

# Authentication System

Implement authentication for the application.

## Requirements

☐ Login
☐ Signup
☐ Logout
☐ Password Reset

                         [Edit]
```

The document should be displayed in a read-only state.

---

# 11. Edit Task

When the user clicks Edit:

```
```

```
setSheetMode("edit");
```

The same Sheet should switch from View mode to Edit mode.

The existing task information should be loaded:

*  Title 
*  Assignee 
*  Description 
*  BlockNote content 

The user can then modify the task and save it.

Flow:

```
```

```
View
 ↓
Edit
 ↓
Modify Task
 ↓
Save
 ↓
Update API
 ↓
Database
```

---

# 12. Fix BlockNote Overflow

The editor should not continuously increase the height of the Sheet.

Long content should wrap inside the editor.

Add CSS:

```
```

```
.bn-editor {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.bn-block-content,
.bn-inline-content {
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}
```

The most important property is:

```
```

```
overflow-wrap: anywhere;
```

This allows long strings without spaces to wrap onto multiple lines.

---

# 13. Constrain the Editor Height

The editor should have its own scrollable area.

Use:

```
```

```
<div className="min-h-0 flex-1 overflow-y-auto">
  <Editor />
</div>
```

For a more controlled layout:

```
```

```
<div className="min-h-0 flex-1 overflow-hidden">
  <div className="h-full overflow-y-auto">
    <Editor />
  </div>
</div>
```

This ensures:

*  The Sheet remains inside the viewport. 
*  Large documents don't expand the Sheet. 
*  Content can scroll vertically. 
*  Horizontal overflow is prevented. 
*  Footer actions remain accessible. 

---

# 14. Recommended Sheet Layout

Use a flex-column layout:

```
```

```
<SheetContent
  side="right"
  className="flex h-full flex-col"
>
  <SheetHeader>
    <SheetTitle>
      {sheetMode === "create"
        ? "Create New Task"
        : sheetMode === "edit"
          ? "Edit Task"
          : "Task Details"}
    </SheetTitle>

    <SheetDescription>
      {sheetMode === "create"
        ? "Add a new task to your list."
        : sheetMode === "edit"
          ? "Update your task details."
          : "View your task details."}
    </SheetDescription>
  </SheetHeader>

  <div className="min-h-0 flex-1 overflow-hidden">
    {/* Task content */}
  </div>

  <SheetFooter>
    {/* Actions */}
  </SheetFooter>
</SheetContent>
```

Important classes:

```
```

```
flex
h-full
flex-col
flex-1
min-h-0
overflow-hidden
```

`min-h-0` is particularly important when using flex layouts because it allows the content area to shrink instead of forcing the Sheet to become larger than the viewport.

---

# 15. Component Structure

Recommended structure:

```
```

```
components/
│
├── ui/
│   └── sheet.tsx
│
├── task/
│   ├── TaskCard.tsx
│   ├── TaskSheet.tsx
│   └── TaskForm.tsx
│
└── editor/
    ├── Editor.tsx
    └── DynamicEditor.tsx
```

### TaskCard.tsx

Responsible for:

*  Displaying the task 
*  Handling task card clicks 
*  Opening the TaskSheet 

### TaskSheet.tsx

Responsible for:

*  Opening/closing Sheet 
*  Create mode 
*  View mode 
*  Edit mode 
*  Selected task 

### TaskForm.tsx

Responsible for:

*  Task title 
*  Assignee 
*  BlockNote editor 
*  Create/update operations 

### Editor.tsx

Responsible only for:

*  BlockNote configuration 
*  Rendering the editor 

---

# 16. Complete User Flow

## Create Task

```
```

```
Click "Create Task"
        ↓
Open Sheet
        ↓
Create Mode
        ↓
Enter Title
        ↓
Select Assignee
        ↓
Write Description
        ↓
BlockNote
        ↓
Create Task
        ↓
API
        ↓
Database
        ↓
Close Sheet
        ↓
Refresh Todo List
```

## View Task

```
```

```
Click Task Card
        ↓
Open Sheet
        ↓
View Mode
        ↓
Display Task Document
```

## Edit Task

```
```

```
Click Task Card
        ↓
View Task
        ↓
Click Edit
        ↓
Edit Mode
        ↓
Modify BlockNote Content
        ↓
Save
        ↓
Update API
        ↓
Database
```

---

# 17. Final Architecture

```
```

```
                         TODO APP
                            │
             ┌──────────────┴──────────────┐
             │                             │
       Create Task                    Task Cards
             │                             │
             ↓                             ↓
       ┌────────────────────────────────────────┐
       │              TASK SHEET                │
       │                                        │
       │  ┌──────────────────────────────────┐  │
       │  │ Header                           │  │
       │  ├──────────────────────────────────┤  │
       │  │                                  │  │
       │  │ Create / View / Edit             │  │
       │  │                                  │  │
       │  │       BlockNote Editor           │  │
       │  │                                  │  │
       │  │       ↕ Internal Scroll          │  │
       │  │                                  │  │
       │  ├──────────────────────────────────┤  │
       │  │ Footer / Actions                 │  │
       │  └──────────────────────────────────┘  │
       └────────────────────────────────────────┘
                            │
                            ↓
                         Todo API
                            │
                            ↓
                         Database
```

---

# 18. Acceptance Criteria

*  Replace existing Dialog with Shadcn Sheet. 
*  Sheet opens from the right. 
*  Create Task opens the Sheet. 
*  Clicking a Task Card opens the Sheet. 
*  Task Card opens in View mode. 
*  View mode displays the complete BlockNote document. 
*  View mode contains an Edit action. 
*  Edit mode loads the existing task. 
*  Create mode starts with an empty editor. 
*  BlockNote content wraps correctly. 
*  Long unbroken text cannot cause horizontal overflow. 
*  Large documents scroll inside the editor. 
*  Sheet remains inside the viewport. 
*  Footer remains accessible. 
*  Create API continues working. 
*  Update API continues working. 
*  Light mode continues working. 
*  Dark mode continues working. 

---

# 19. Final Goal

The goal is to transform the Todo task experience from a simple Dialog-based form into a **document-oriented task management interface**.

```
```

```
Simple Todo
    ↓
Title + Description
    ↓
Centered Dialog

             ↓

Improved Todo
    ↓
Title + Assignee + Rich Document
    ↓
Right-side Sheet
    ↓
Create / View / Edit
    ↓
BlockNote
    ↓
Scrollable Document
```
