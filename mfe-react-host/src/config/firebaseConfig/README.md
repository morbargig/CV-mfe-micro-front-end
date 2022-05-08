best use with 
```ts
import firebaseConfig from '../config/firebaseConfig/firebaseConfig.json';
export default {
    apiKey: process.env.API_KEY || firebaseConfig.apiKey,
    authDomain: process.env.AUTH_DOMAIN || firebaseConfig.authDomain,
    databaseURL: process.env.DATABASE_URL || firebaseConfig.databaseURL,
    projectId: process.env.PROJECT_ID || firebaseConfig.projectId,
    storageBucket: process.env.STORAGE_BUCKET || firebaseConfig.storageBucket,
    messagingSenderId: process.env.MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
    appId: process.env.APP_ID || firebaseConfig.appId
}f
```
