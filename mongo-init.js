// MongoDB initialization script for portfolio database
db = db.getSiblingDB('portfolio');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('portfolios');
db.createCollection('contacts');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.portfolios.createIndex({ "title": 1 });
db.portfolios.createIndex({ "category": 1 });
db.portfolios.createIndex({ "createdAt": -1 });

db.contacts.createIndex({ "email": 1 });
db.contacts.createIndex({ "createdAt": -1 });

print('Portfolio database initialized successfully'); 