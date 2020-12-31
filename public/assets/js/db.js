// * Global Variable
let db;
const req = indexedDB.open('budget', 1);

// * Manage Req
req.onupgradeneeded = e => {
  const db = e.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
};

req.onsuccess = e => {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
req.onerror = e => {
  console.log("Request Error: ", e.target.errorCode);
};

// * Functions
const saveRecord = (record) => {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}
 
const checkDatabase = () => {
   const transaction = db.transaction(["pending"], "readwrite");
   const store = transaction.objectStore("pending");
   const getAll = store.getAll();
 
   getAll.onsuccess = function() {
     if (getAll.result.length > 0) {
       fetch("/api/transaction/bulk", {
         method: "POST",
         body: JSON.stringify(getAll.result),
         headers: {
           Accept: "application/json, text/plain, */*",
           "Content-Type": "application/json"
         }
       })
       .then(response => response.json())
       .then(() => {
         const transaction = db.transaction(["pending"], "readwrite");
         const store = transaction.objectStore("pending");
         store.clear();
       });
     }
   };
}

window.addEventListener("online", checkDatabase);