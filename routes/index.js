const express = require('express');

module.exports = function({ query }, config) {
  const router = express.Router();

  // Main page
  router.get('/', (req, res) => {
    res.render('index', {
      page: 'dashboard',
      appName: config.appName,
    });
  });

  // API: list all distinct series IDs with titles
  router.get('/api/series', async (req, res) => {
    try {
      const rows = await query(`
        SELECT c.series_id, COALESCE(s.series_title, c.series_id) AS series_title
        FROM (SELECT DISTINCT series_id FROM ces_data) c
        LEFT JOIN series_info s USING (series_id)
        ORDER BY c.series_id
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: get data for a specific series, excluding annual averages (M13)
  router.get('/api/series/:id', async (req, res) => {
    try {
      const id = req.params.id;

      const [info] = await query(`
        SELECT COALESCE(series_title, ?) AS series_title,
               COALESCE(data_type_text, 'Value') AS data_type_text
        FROM series_info WHERE series_id = ?
      `, id, id);

      const rows = await query(`
        SELECT year, month, value
        FROM ces_data
        WHERE series_id = ? AND period != 'M13'
        ORDER BY year, month
      `, id);

      const data = rows.map(r => ({
        date: `${r.year}-${String(r.month).padStart(2, '0')}-01`,
        value: r.value,
      }));

      res.json({
        series_id: id,
        series_title: info ? info.series_title : id,
        data_type_text: info ? info.data_type_text : 'Value',
        data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
