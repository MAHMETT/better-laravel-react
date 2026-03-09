# Sonner Toast – Usage Reference (For AI Coder)

Library: Sonner
Scope: **Usage only** (no setup)

---

# 1. Basic Toast

```ts
toast('Saved successfully');
```

Returns: `toastId`

---

# 2. Variants

## Success

```ts
toast.success('Saved');
```

## Error

```ts
toast.error('Failed to save');
```

## Info

```ts
toast.info('New update available');
```

## Warning

```ts
toast.warning('Unsaved changes');
```

---

# 3. With Options

```ts
toast("Profile updated", {
  description: "Changes saved to database",
  duration: 4000,
  id: "profile-toast",
  icon: <Icon />,
  className: "custom-toast",
})
```

---

# 4. Action Buttons

```ts
toast('Item deleted', {
    action: {
        label: 'Undo',
        onClick: () => restoreItem(),
    },
    cancel: {
        label: 'Close',
        onClick: () => console.log('closed'),
    },
});
```

---

# 5. Loading Toast

```ts
const id = toast.loading('Uploading...');
```

Update it:

```ts
toast.success('Upload complete', { id });
```

Error update:

```ts
toast.error('Upload failed', { id });
```

---

# 6. Promise (Recommended for Async)

```ts
toast.promise(apiCall(), {
    loading: 'Processing...',
    success: 'Completed',
    error: 'Failed',
});
```

---

## Dynamic Message

```ts
toast.promise(fetchUser(), {
    loading: 'Loading user...',
    success: (data) => `Welcome ${data.name}`,
    error: (err) => err.message,
});
```

---

## Await Result

```ts
const result = await toast
    .promise(apiCall(), {
        loading: 'Processing...',
        success: 'Done',
        error: 'Error',
    })
    .unwrap();
```

---

# 7. Custom Toast (Full Control)

```tsx
toast.custom((id) => (
    <div className="rounded bg-black p-4 text-white">
        <p>Custom UI</p>
        <button onClick={() => toast.dismiss(id)}>Close</button>
    </div>
));
```

---

# 8. Message Variant

```ts
toast.message('Simple message');
```

---

# 9. Manual Dismiss

Dismiss specific:

```ts
toast.dismiss(id);
```

Dismiss all:

```ts
toast.dismiss();
```

---

# 10. Access State

Get active toasts:

```ts
toast.getToasts();
```

Get history:

```ts
toast.getHistory();
```

---

# 11. Update Existing Toast

```ts
toast('Saving...', { id: 'save' });

toast.success('Saved!', { id: 'save' });
```

Same `id` → updates instead of creating new toast.

---

# 12. Production Patterns

## Async Form Submit

```ts
const submit = async () => {
    await toast.promise(saveForm(), {
        loading: 'Saving...',
        success: 'Saved successfully',
        error: 'Failed to save',
    });
};
```

---

## Optimistic UI

```ts
const id = toast.loading('Deleting...');

try {
    await deleteItem();
    toast.success('Deleted', { id });
} catch {
    toast.error('Failed', { id });
}
```

---

End of usage reference.
