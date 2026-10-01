// Aceita datas no formato AAAA-MM-DD
function dataValida(d) {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d));
}

module.exports = { dataValida };