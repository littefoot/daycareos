import { seedInitialFirestoreData } from '../src/services/firebaseService';

async function main() {
  console.log('Seeding Cloud Firestore with 24 children, 24 parents, 6 providers, 3 home visitors...');
  const result = await seedInitialFirestoreData();
  console.log('Result:', result);
  process.exit(result.success ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
