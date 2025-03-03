const db = require('../config/db');

const Olahraga = {
  create: (eventData, callback) => {
    const query = 'INSERT INTO olahraga (name, description, date, location, poster, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [
      eventData.name, eventData.description, eventData.date, eventData.location,
      eventData.poster, eventData.status || 'published', eventData.created_by
    ], callback);
  },

  getByAdmin: (adminId, callback) => {
    const query = 'SELECT * FROM olahraga WHERE created_by = ?';
    db.query(query, [adminId], callback);
  },

  getAllPublished: (callback) => {
    const query = 'SELECT * FROM olahraga WHERE status = "published"';
    db.query(query, callback);
  },

  update: (id, eventData, callback) => {
    const query = 'UPDATE olahraga SET name = ?, description = ?, date = ?, location = ?, poster = ? WHERE id = ?';
    db.query(query, [eventData.name, eventData.description, eventData.date, eventData.location, eventData.poster, id], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM olahraga WHERE id = ?';
    db.query(query, [id], callback);
  },
};

module.exports = Olahraga;