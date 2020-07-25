const dbName = "FeatherDB";
const version = 1;

function openDb() {
  return new Promise(function(resolve, reject) {
    if (typeof window === "undefined") {
      reject(new Error("No window object"));
      return;
    }

    var request = window.indexedDB.open(dbName, version);

    request.onerror = function(event) {
      reject(event);
    };

    request.onsuccess = function(event) {
      resolve(request.result);
    };

    request.onupgradeneeded = function(event) {
      const db = request.result;
      if (!db.objectStoreNames.contains("state")) {
        db.createObjectStore("state", {
          keyPath: "id"
        });
        var txn = event.target.transaction;
        txn.oncomplete = function(event) {
          resolve(db);
        };
      } else {
        resolve(db);
      }
    };
  });
}

function fetchCurrentState() {
  return new Promise(function(resolve, reject) {
    openDb()
      .then(db => {
        var request = db
          .transaction(["state"])
          .objectStore("state")
          .get("current");

        request.onerror = function(event) {
          reject(event);
        };

        request.onsuccess = function(event) {
          resolve(request.result);
        };
      })
      .catch(e => resolve(null));
  });
}

function updateCurrentState(state) {
  return new Promise(function(resolve, reject) {
    openDb()
      .then(db => {
        state.id = "current";
        var request = db
          .transaction(["state"], "readwrite")
          .objectStore("state")
          .put(state);

        request.onerror = function(event) {
          reject(event);
        };

        request.onsuccess = function(event) {
          resolve(event);
        };
      })
      .catch(e => resolve(null));
  });
}

module.exports = { fetchCurrentState, updateCurrentState };
