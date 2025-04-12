class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
      this.users = new Set(); // Stores user IDs
    }
  }
  
  export class UserSearchTrie {
    constructor() {
      this.root = new TrieNode();
      this.userMap = new Map(); // user ID -> user object
    }
  
    insert(word, userId) {
      let node = this.root;
      word = word.toLowerCase();
      
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
        node.users.add(userId);
      }
      
      node.isEndOfWord = true;
    }
  
    search(prefix) {
      let node = this.root;
      prefix = prefix.toLowerCase();
      
      for (const char of prefix) {
        if (!node.children[char]) {
          return [];
        }
        node = node.children[char];
      }
      
      // Return unique users (convert Set to Array and map to user objects)
      return Array.from(node.users).map(id => this.userMap.get(id));
    }
  
    addUser(user) {
      if (!user?._id || !user?.username) return;
      
      this.userMap.set(user._id, user);
      this.insert(user.username, user._id);
      
      if (user.name) {
        this.insert(user.name, user._id);
      }
    }
  
    bulkAddUsers(users) {
      users.forEach(user => this.addUser(user));
    }
  }
  
  // Helper function to debounce search input
  export function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }