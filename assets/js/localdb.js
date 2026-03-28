class LocalDB {
  constructor() {
    this.dbName = 'ISOP';
    this.version = 1;
    this.db = null;
    this.ready = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);

      req.onerror = () => {
        console.error('IndexedDB init error');
        reject(req.error);
      };

      req.onsuccess = async () => {
        this.db = req.result;
        await this.seedData();
        console.log('✅ localDB ready');
        resolve();
      };

      req.onupgradeneeded = (e) => {
        this.db = e.target.result;

        const stores = [
          'users',
          'opportunities',
          'applications',
          'savedOpportunities',
          'meetings',
          'notifications',
          'mentors',
          'trainingModules'
        ];

        stores.forEach(name => {
          if (!this.db.objectStoreNames.contains(name)) {
            this.db.createObjectStore(name, { keyPath: 'id' });
          }
        });
      };
    });
  }

  async getCollection(name) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([name], 'readonly');
      const store = tx.objectStore(name);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async setCollection(name, items) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([name], 'readwrite');
      const store = tx.objectStore(name);

      const clearReq = store.clear();

      clearReq.onsuccess = () => {
        items.forEach(item => store.put(item));
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async addItem(name, item) {
    await this.ready;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([name], 'readwrite');
      const store = tx.objectStore(name);
      const req = store.put(item);

      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async findUserByEmail(email) {
    const users = await this.getCollection('users');
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createUser(user) {
    const newUser = {
      id: user.id || `user_${Date.now()}`,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'student'
    };

    await this.addItem('users', newUser);
    return newUser;
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('isop_auth'));
  }

  setCurrentUser(user) {
    localStorage.setItem('isop_auth', JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem('isop_auth');
  }

  async seedData() {
    const users = await this.getCollection('users');

    if (users.length === 0) {
      const demoUsers = [
        {
          id: 'student_user',
          email: 'student@isop.com',
          password: 'student123',
          role: 'student',
          name: 'Demo Student'
        },
        {
          id: 'mentor_user',
          email: 'mentor@isop.com',
          password: 'mentor123',
          role: 'mentor',
          name: 'Demo Mentor'
        },
        {
          id: 'admin_user',
          email: 'admin@isop.com',
          password: 'admin123',
          role: 'admin',
          name: 'Demo Admin'
        }
      ];

      for (const user of demoUsers) {
        await this.addItem('users', user);
      }
    }
  }
}

window.localDB = new LocalDB();