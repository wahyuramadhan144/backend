const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const supabase = require("../config/db.js");

const router = express.Router();
const upload = multer(); 

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File Excel tidak ditemukan" });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const rowsToInsert = jsonData.map((row) => ({
      bulan: row.bulan,
      nama: row.nama,
      review: row.review,
      rating: row.rating || null,
      created_at: row.created_at || new Date().toISOString(),
    }));

    const { error } = await supabase.from("vc_reviews").insert(rowsToInsert);

    if (error) throw error;

    res.status(200).json({
      message: `Import data dari Excel berhasil. Total: ${rowsToInsert.length} baris`,
    });
  } catch (err) {
    console.error("Gagal import data:", err.message);
    res.status(500).json({ error: "Gagal import data dari Excel" });
  }
});

module.exports = router;
