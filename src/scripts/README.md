# Scripts

Administrative scripts for StudioFlow.

## setAdmin.js

Script to manage admin users for StudioFlow.

### Setup

1. Get your Firebase service account key:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-service-account-key.json` in project root

2. Install firebase-admin if not already installed:
   ```bash
   npm install firebase-admin
   ```

### Usage

```bash
node src/scripts/setAdmin.js
```

The script provides an interactive menu to:
- Set a user as admin
- Remove admin privileges
- Check admin status

**Important**: After setting admin claims, users must logout and login again for changes to take effect.

### Example

```
🔧 StudioFlow Admin Management
1. Set user as admin
2. Remove admin from user
3. Check admin status
4. Exit

Select option (1-4): 1
Enter email to make admin: user@example.com
Found user: user@example.com (UID: abc123...)
✅ Admin claim successfully set for user@example.com
⚠️  User needs to logout and login again for changes to take effect
```