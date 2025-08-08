const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to: Project Settings → Service Accounts → Generate new private key
// Place it one directory up from the project root (outside git repo)
const serviceAccount = require('../../../firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim successfully set for ${email}`);
    console.log('⚠️  User needs to logout and login again for changes to take effect');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${email} not found`);
    } else {
      console.error('❌ Error setting admin claim:', error.message);
    }
  }
}

async function removeAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    // Remove admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: false });
    console.log(`✅ Admin claim successfully removed for ${email}`);
    console.log('⚠️  User needs to logout and login again for changes to take effect');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${email} not found`);
    } else {
      console.error('❌ Error removing admin claim:', error.message);
    }
  }
}

async function checkAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    // Get custom claims
    const userRecord = await admin.auth().getUser(user.uid);
    const isAdmin = userRecord.customClaims?.admin === true;
    
    console.log(`Admin status: ${isAdmin ? '✅ ADMIN' : '❌ NOT ADMIN'}`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User with email ${email} not found`);
    } else {
      console.error('❌ Error checking admin claim:', error.message);
    }
  }
}

function showMenu() {
  console.log('\n🔧 StudioFlow Admin Management');
  console.log('1. Set user as admin');
  console.log('2. Remove admin from user');
  console.log('3. Check admin status');
  console.log('4. Exit');
  console.log('');
}

function promptUser() {
  showMenu();
  rl.question('Select option (1-4): ', async (choice) => {
    switch (choice) {
      case '1':
        rl.question('Enter email to make admin: ', async (email) => {
          await setAdminClaim(email.trim());
          promptUser();
        });
        break;
      case '2':
        rl.question('Enter email to remove admin: ', async (email) => {
          await removeAdminClaim(email.trim());
          promptUser();
        });
        break;
      case '3':
        rl.question('Enter email to check admin status: ', async (email) => {
          await checkAdminClaim(email.trim());
          promptUser();
        });
        break;
      case '4':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid choice. Please select 1-4.');
        promptUser();
        break;
    }
  });
}

// Check if service account file exists
try {
  require.resolve('../../../firebase-service-account-key.json');
  console.log('✅ Service account key found');
  promptUser();
} catch (error) {
  console.error('❌ Service account key not found!');
  console.log('');
  console.log('To get your service account key:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the downloaded file as "firebase-service-account-key.json" one directory UP from the project root');
  console.log('   (so it\'s outside the git repository and won\'t be committed)');
  console.log('4. Run this script again');
  process.exit(1);
}