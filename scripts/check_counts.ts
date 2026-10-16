import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function check() {
  const snap = await getDocs(collection(db, 'children'));
  console.log('Total children in Firestore:', snap.size);
  snap.forEach(d => {
    const data = d.data();
    console.log(`- ${d.id}: ${data.fullName} (provider: ${data.providerId || 'none'}, stage: ${data.admissionsStage || 'none'})`);
  });

  const provSnap = await getDocs(collection(db, 'providers'));
  console.log('Total providers in Firestore:', provSnap.size);

  const parentSnap = await getDocs(collection(db, 'parents'));
  console.log('Total parents in Firestore:', parentSnap.size);

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
