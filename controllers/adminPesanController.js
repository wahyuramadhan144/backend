const xlsx = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.getMessages = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("fans_messages")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Gagal ambil pesan:", err.message);
    res.status(500).json({ error: "Gagal ambil pesan" });
  }
};

// CREATE pesan baru
exports.createMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;
    if (!sender || !message)
      return res.status(400).json({ error: "Sender dan message wajib diisi" });

    const { error } = await supabase
      .from("fans_messages")
      .insert([{ sender, message, is_approve: false }]);

    if (error) throw error;

    res.status(201).json({ message: "Pesan berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah pesan:", err.message);
    res.status(500).json({ error: "Gagal tambah pesan" });
  }
};

exports.approveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("fans_messages")
      .update({ is_approve: true })
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Pesan disetujui" });
  } catch (err) {
    console.error("Gagal approve pesan:", err.message);
    res.status(500).json({ error: "Gagal approve pesan" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("fans_messages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Pesan berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus pesan:", err.message);
    res.status(500).json({ error: "Gagal hapus pesan" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("review_vc")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Gagal ambil review:", err.message);
    res.status(500).json({ error: "Gagal ambil review" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { nama, tanggal, review, rating } = req.body;
    if (!nama || !tanggal || !review)
      return res
        .status(400)
        .json({ error: "Field nama, tanggal, dan review wajib diisi" });

    const { error } = await supabase.from("review_vc").insert([
      {
        nama,
        tanggal,
        review,
        rating: rating || null,
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: "Review berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal tambah review:", err.message);
    res.status(500).json({ error: "Gagal tambah review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("review_vc").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Review berhasil dihapus" });
  } catch (err) {
    console.error("Gagal hapus review:", err.message);
    res.status(500).json({ error: "Gagal hapus review" });
  }
};

exports.importReviewFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res.status(400).json({ error: "File Excel tidak ditemukan" });

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const rowsToInsert = data
      .filter((row) => row.nama && row.tanggal && row.review)
      .map((row) => ({
        nama: row.nama,
        tanggal: row.tanggal,
        review: row.review,
        rating: row.rating || null,
      }));

    if (rowsToInsert.length === 0)
      return res
        .status(400)
        .json({ error: "Tidak ada data valid di file Excel" });

    const { error } = await supabase.from("review_vc").insert(rowsToInsert);

    if (error) throw error;

    res.status(200).json({
      message: `Import data dari Excel berhasil. Total: ${rowsToInsert.length} baris`,
    });
  } catch (err) {
    console.error("Gagal import Excel:", err.message);
    res.status(500).json({ error: "Gagal import data dari Excel" });
  }
};
