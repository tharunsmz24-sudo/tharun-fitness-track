const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read/write JSON files
const readFile = (collection) => {
  const file = path.join(DATA_DIR, `${collection.toLowerCase()}s.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return [];
  }
};

const writeFile = (collection, data) => {
  const file = path.join(DATA_DIR, `${collection.toLowerCase()}s.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Generate a random MongoDB-like ObjectId string
const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// JS implementation of Mongo Query matching
const matchQuery = (item, query) => {
  if (!query) return true;
  return Object.keys(query).every((key) => {
    const val = query[key];
    
    // Date range queries e.g., { date: { $gte: start, $lte: end } }
    if (val && typeof val === 'object') {
      const itemVal = new Date(item[key]);
      return Object.keys(val).every((op) => {
        const opVal = new Date(val[op]);
        if (op === '$gte') return itemVal >= opVal;
        if (op === '$lte') return itemVal <= opVal;
        if (op === '$gt') return itemVal > opVal;
        if (op === '$lt') return itemVal < opVal;
        if (op === '$regex') {
          const regex = new RegExp(val.$regex, val.$options || '');
          return regex.test(item[key]);
        }
        return true;
      });
    }

    // Standard matching
    if (key === '$or' && Array.isArray(val)) {
      return val.some((subQuery) => matchQuery(item, subQuery));
    }
    
    return String(item[key]) === String(val);
  });
};

// Factory to create mock models replicating Mongoose API
const getMockModel = (collectionName) => {
  class MockModel {
    constructor(data = {}) {
      Object.assign(this, data);
      if (!this._id) {
        this._id = generateId();
      }
      if (!this.createdAt) this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
    }

    // Instance method: save (handles insert & update)
    async save() {
      const items = readFile(collectionName);
      const index = items.findIndex((item) => String(item._id) === String(this._id));

      // Trigger pre-save hooks manually for DietRecords & Users
      if (collectionName === 'DietRecord' && this.foodItems) {
        this.totalCalories = this.foodItems.reduce((sum, f) => sum + Number(f.calories || 0), 0);
        this.totalProtein = this.foodItems.reduce((sum, f) => sum + Number(f.protein || 0), 0);
        this.totalCarbs = this.foodItems.reduce((sum, f) => sum + Number(f.carbs || 0), 0);
        this.totalFat = this.foodItems.reduce((sum, f) => sum + Number(f.fat || 0), 0);
      }

      if (collectionName === 'User' && this.password && !this.password.startsWith('$2a$')) {
        // Hash password if modified / raw
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      const rawData = { ...this };
      // Delete any helper methods
      delete rawData.matchPassword;
      delete rawData.save;
      delete rawData.deleteOne;

      if (index >= 0) {
        items[index] = rawData;
      } else {
        items.push(rawData);
      }

      writeFile(collectionName, items);
      return this;
    }

    async deleteOne() {
      const items = readFile(collectionName);
      const filtered = items.filter((item) => String(item._id) !== String(this._id));
      writeFile(collectionName, filtered);
      return { deletedCount: 1 };
    }

    // Mock User password validation
    async matchPassword(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }

    // Static APIs
    static find(query = {}) {
      const items = readFile(collectionName);
      const matched = items.filter((item) => matchQuery(item, query));
      
      // Return chainable mock helper
      return {
        sort: function(sortObj) {
          matched.sort((a, b) => {
            const field = Object.keys(sortObj)[0];
            const dir = sortObj[field];
            if (a[field] < b[field]) return dir === -1 ? 1 : -1;
            if (a[field] > b[field]) return dir === -1 ? -1 : 1;
            return 0;
          });
          return this;
        },
        limit: function(num) {
          return matched.slice(0, num);
        },
        then: function(callback) {
          return Promise.resolve(callback(matched));
        },
        // Support await directly
        [Symbol.toStringTag]: 'Promise',
        then: (onfulfilled) => Promise.resolve(matched).then(onfulfilled)
      };
    }

    static findOne(query = {}) {
      const items = readFile(collectionName);
      const found = items.find((item) => matchQuery(item, query));

      // Return a thenable query object with .select() for Mongoose compatibility
      const queryObj = {
        select: function() { return queryObj; },
        sort: function() { return queryObj; },
        lean: function() { return queryObj; },
        then: (onfulfilled, onrejected) => {
          const result = found ? new MockModel(found) : null;
          return Promise.resolve(result).then(onfulfilled, onrejected);
        },
        catch: (onrejected) => {
          return Promise.resolve(found ? new MockModel(found) : null).catch(onrejected);
        }
      };
      return queryObj;
    }

    static findById(id) {
      if (!id) {
        return {
          select: function() { return this; },
          sort: function() { return this; },
          lean: function() { return this; },
          then: (onfulfilled, onrejected) => Promise.resolve(null).then(onfulfilled, onrejected),
          catch: (onrejected) => Promise.resolve(null).catch(onrejected)
        };
      }
      const items = readFile(collectionName);
      const found = items.find((item) => String(item._id) === String(id));

      const queryObj = {
        select: function() { return queryObj; },
        sort: function() { return queryObj; },
        lean: function() { return queryObj; },
        then: (onfulfilled, onrejected) => {
          const result = found ? new MockModel(found) : null;
          return Promise.resolve(result).then(onfulfilled, onrejected);
        },
        catch: (onrejected) => {
          return Promise.resolve(found ? new MockModel(found) : null).catch(onrejected);
        }
      };
      return queryObj;
    }

    static async create(data = {}) {
      const instance = new MockModel(data);
      await instance.save();
      return instance;
    }

    static async findByIdAndUpdate(id, update = {}, options = {}) {
      const items = readFile(collectionName);
      const index = items.findIndex((item) => String(item._id) === String(id));
      if (index < 0) return null;

      // Handle Mongoose $set or direct values
      const fields = update.$set || update;
      items[index] = { ...items[index], ...fields, updatedAt: new Date().toISOString() };
      
      writeFile(collectionName, items);
      return new MockModel(items[index]);
    }

    static async updateMany(query = {}, update = {}) {
      const items = readFile(collectionName);
      let modifiedCount = 0;
      const fields = update.$set || update;

      const updated = items.map((item) => {
        if (matchQuery(item, query)) {
          modifiedCount++;
          return { ...item, ...fields, updatedAt: new Date().toISOString() };
        }
        return item;
      });

      writeFile(collectionName, updated);
      return { modifiedCount };
    }

    static async deleteMany(query = {}) {
      const items = readFile(collectionName);
      const remaining = items.filter((item) => !matchQuery(item, query));
      const deletedCount = items.length - remaining.length;
      writeFile(collectionName, remaining);
      return { deletedCount };
    }

    static async countDocuments(query = {}) {
      const items = readFile(collectionName);
      return items.filter((item) => matchQuery(item, query)).length;
    }

    // Mock Aggregations for dashboard & coach metrics
    static async aggregate(pipeline = []) {
      const items = readFile(collectionName);
      
      // Mock Activity Aggregation: Group by null and calculate averages
      if (collectionName === 'Activity') {
        let totalSteps = 0;
        let sumSteps = 0;
        let sumActive = 0;
        let sumWater = 0;
        let count = items.length;

        items.forEach((act) => {
          totalSteps += act.steps || 0;
          sumSteps += act.steps || 0;
          sumActive += act.activeMinutes || 0;
          sumWater += act.waterIntake || 0;
        });

        return [{
          _id: null,
          avgSteps: count > 0 ? sumSteps / count : 0,
          avgActiveMinutes: count > 0 ? sumActive / count : 0,
          avgWaterIntake: count > 0 ? sumWater / count : 0,
          totalSteps
        }];
      }

      // Mock Workout Aggregation: Group by category
      if (collectionName === 'Workout') {
        const groups = {};
        items.forEach((w) => {
          if (!groups[w.category]) {
            groups[w.category] = { category: w.category, count: 0, sumDuration: 0, totalCalories: 0 };
          }
          groups[w.category].count++;
          groups[w.category].sumDuration += w.duration || 0;
          groups[w.category].totalCalories += w.caloriesBurned || 0;
        });

        return Object.keys(groups).map((cat) => ({
          _id: cat,
          count: groups[cat].count,
          avgDuration: groups[cat].sumDuration / groups[cat].count,
          totalCalories: groups[cat].totalCalories
        }));
      }

      return [];
    }
  }

  // Support chaining select(fields) on findOne etc.
  MockModel.select = function() { return this; };

  return MockModel;
};

module.exports = { getMockModel };
