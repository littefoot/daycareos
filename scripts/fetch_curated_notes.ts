import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import fs from 'fs';

async function main() {
  console.log('Fetching developer_notes from Firestore...');
  const notesCol = collection(db, 'developer_notes');
  const snapshot = await getDocs(notesCol);
  console.log(`Found ${snapshot.docs.length} documents in developer_notes.`);

  const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  fs.writeFileSync('scripts/firestore_developer_notes.json', JSON.stringify(notes, null, 2));
  console.log('Saved to scripts/firestore_developer_notes.json');

  // Also check ai_chat_conversations
  try {
    const chatCol = collection(db, 'ai_chat_conversations');
    const chatSnap = await getDocs(chatCol);
    console.log(`Found ${chatSnap.docs.length} documents in ai_chat_conversations.`);
    const chats = chatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    fs.writeFileSync('scripts/firestore_ai_chat.json', JSON.stringify(chats, null, 2));
  } catch (e) {
    console.warn('ai_chat_conversations fetch notice:', e);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error fetching notes:', err);
  process.exit(1);
});
