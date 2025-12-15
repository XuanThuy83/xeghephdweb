// =============== TELEGRAM CONFIG ==================
// ⚠️ Dán BOT TOKEN + CHAT ID của bạn ở đây
const TELEGRAM_BOT_TOKEN = "8551695567:AAHi6pDHqp-RpJ3O-Mec1DraeqfkDIZ1sGw";
const TELEGRAM_CHAT_ID = "6529163985";

// Gửi ngầm, lỗi chỉ log trong console, KHÔNG hiện popup
function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) console.error("Telegram trả về lỗi:", data);
    })
    .catch((err) => console.error("Không gửi được tới Telegram:", err));
}

document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("bookingForm");
  const contactForm = document.getElementById("contactForm");
  const dateInput = document.querySelector('input[name="date"]');

  function formatDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    return parts[2] + "/" + parts[1] + "/" + parts[0] + " " + timeStr;
  }

  function getSelectedText(selectEl) {
    if (!selectEl) return "";
    const opt = selectEl.options[selectEl.selectedIndex];
    return opt ? opt.text.trim() : "";
  }

  // ===== FORM ĐẶT XE → GỬI NGẦM VỀ TELEGRAM =====
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      const fromSelect = bookingForm.querySelector('select[name="from"]');
      const toSelect = bookingForm.querySelector('select[name="to"]');

      const fromText = getSelectedText(fromSelect);
      const toText = getSelectedText(toSelect);

      const phone = formData.get("phone") || "";
      const name = formData.get("name") || "";
      const date = formData.get("date");
      const timeSlot = formData.get("time_slot");
      const serviceInput = document.querySelector('input[name="service"]:checked');
      const service = serviceInput ? serviceInput.value : "";

      const timeText = formatDateTime(date, timeSlot);

      const text =
        `<b>📌 Có đơn đặt xe mới</b>\n\n` +
        `• <b>Tên:</b> ${name}\n` +
        `• <b>SĐT:</b> ${phone}\n` +
        `• <b>Tuyến:</b> ${fromText} → ${toText}\n` +
        (timeText ? `• <b>Thời gian:</b> ${timeText}\n` : "") +
        `• <b>Dịch vụ:</b> ${service}\n`;

      // Gửi ngầm, không chờ kết quả
      sendToTelegram(text);

      // Thông báo cho khách — KHÔNG nhắc tới Telegram
      alert("Đặt xe thành công! Chúng tôi sẽ liên hệ lại qua Zalo/điện thoại.");
      bookingForm.reset();

      // set lại min cho ngày (tránh chọn quá khứ)
      if (dateInput) {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        dateInput.min =
          today.getFullYear() +
          "-" +
          pad(today.getMonth() + 1) +
          "-" +
          pad(today.getDate());
      }
    });
  }

  // ===== FORM GỬI THÔNG TIN → GỬI NGẦM VỀ TELEGRAM =====
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const name = formData.get("name") || "";
      const phone = formData.get("phone") || "";
      const type = formData.get("type") || "";
      const message = formData.get("message") || "(không có)";

      const text =
        `<b>📩 Khách gửi yêu cầu liên hệ</b>\n\n` +
        `• <b>Tên:</b> ${name}\n` +
        `• <b>SĐT:</b> ${phone}\n` +
        `• <b>Loại yêu cầu:</b> ${type}\n` +
        `• <b>Nội dung:</b> ${message}\n`;

      sendToTelegram(text);
      alert("Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
      contactForm.reset();
    });
  }
});
