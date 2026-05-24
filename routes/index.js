const express = require('express');

module.exports = function(db, config) {
  const router = express.Router();

  // Main page
  router.get('/', (req, res) => {
    res.render('index', {
      page: 'dashboard',
      appName: config.appName,
    });
  });

  // API: list all distinct series IDs with titles
  router.get('/api/series', (req, res) => {
    const rows = db.prepare(`
      SELECT c.series_id, COALESCE(s.series_title, c.series_id) AS series_title
      FROM (SELECT DISTINCT series_id FROM ces_data) c
      LEFT JOIN series_info s USING (series_id)
      ORDER BY c.series_id
    `).all();
    res.json(rows);
  });

  // API: get data for a specific series, excluding annual averages (M13)
  router.get('/api/series/:id', (req, res) => {
    const info = db.prepare(`
      SELECT COALESCE(series_title, ?) AS series_title,
             COALESCE(data_type_text, 'Value') AS data_type_text
      FROM series_info WHERE series_id = ?
    `).get(req.params.id, req.params.id);

    const rows = db.prepare(`
      SELECT year, month, value
      FROM ces_data
      WHERE series_id = ? AND period != 'M13'
      ORDER BY year, month
    `).all(req.params.id);

    const data = rows.map(r => ({
      date: `${r.year}-${String(r.month).padStart(2, '0')}-01`,
      value: r.value,
    }));

    res.json({
      series_id: req.params.id,
      series_title: info ? info.series_title : req.params.id,
      data_type_text: info ? info.data_type_text : 'Value',
      data,
    });
  });

  return router;
};
