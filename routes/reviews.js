const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const supabase = require("../config/supabase");

const router = express.Router();
const upload = multer();

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File Excel tidak ditemukan" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const rows = jsonData.map(row => ({
      message: row.message,
      sender: row.sender,
      created_at: row.created_at || new Date().toISOString(),
      is_approve: row.is_approve === true || row.is_approve === "true",
    }));

    const { error } = await supabase
      .from("nama_tabel_kamu")
      .insert(rows);

    if (error) throw error;

    res.status(200).json({ message: `Berhasil import ${rows.length} data` });
  } catch (err) {
    console.error("❌ Error import:", err.message);
    res.status(500).json({ error: "Gagal import data" });
  }
});

module.exports = router;
