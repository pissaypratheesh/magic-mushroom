import idb from 'idb';

var _ = require('underscore');
_.mixin(require('./mixins'));

function idbArrToJson(arr) {
  let obj = {};
  _.each(arr,(value)=>{
    obj[value.id] = value.val
  })
  return obj;
}

function indexedDb(dbName,storeName){
  const dbPromise = idb.open(dbName,1,(db)=>{
    db.createObjectStore(storeName,{
      keyPath: 'id'
    })
  });
  return {
    get(key) {
      return dbPromise.then(db => {
        return db.transaction(storeName)
          .objectStore(storeName).get(key);
      });
    },

    getAll(){
      return dbPromise.then(db => {
        return db.transaction(storeName)
          .objectStore(storeName).getAll();
      });
    },

    set(key, val) {
      return dbPromise.then(db => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put({id:key,val:val});
        return tx.complete;
      });
    },

    delete(key) {
      return dbPromise.then(db => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(key);
        return tx.complete;
      });
    },
    clear() {
      return dbPromise.then(db => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        return tx.complete;
      });
    },
    keys() {
      return dbPromise.then(db => {
        const tx = db.transaction(storeName);
        const keys = [];
        const store = tx.objectStore(storeName);

        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // openKeyCursor isn't supported by Safari, so we fall back
        (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
          if (!cursor) return;
          keys.push(cursor.key);
          cursor.continue();
        });

        return tx.complete.then(() => keys);
      });
    }
  };
}


export {idbArrToJson, indexedDb};
