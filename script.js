function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("bookingForm");
  const contactForm = document.getElementById("contactForm");
  const dateInput = document.querySelector('input[name="date"]');

  // Khóa ngày đã trôi qua
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

  // ====== BẢNG GIÁ & FILTER ĐIỂM ĐI/ĐẾN ======
  const fromSelect = document.querySelector('select[name="from"]');
  const toSelect = document.querySelector('select[name="to"]');
  const priceValue = document.querySelector(".price-value");

  function getCity(code) {
    if (!code) return null;
    if (code.startsWith("HN-")) return "HN";
    if (code.startsWith("HD-")) return "HD";
    if (code.startsWith("NB-")) return "NB";
    return null;
  }

  function resetOptions(select) {
    Array.from(select.options).forEach(function (opt) {
      opt.hidden = false;
    });
  }

  // Tự động khóa sai tuyến:
  // - Ở tab tuyến thường: ẩn các option cùng tỉnh với điểm đi (không cho HN->HN hoặc HD->HD)
  function filterSelect(sourceSelect, targetSelect) {
    const val = sourceSelect.value;
    resetOptions(targetSelect);
    if (!val) return;

    const city = getCity(val);
    if (!city) return;

    Array.from(targetSelect.options).forEach(function (opt) {
      if (!opt.value) return;
      const optCity = getCity(opt.value);
      if (!optCity) return;
      if (optCity === city) opt.hidden = true;
    });

    // Nếu lỡ còn đang chọn cùng tỉnh -> reset
    if (targetSelect.value) {
      const targetCity = getCity(targetSelect.value);
      if (targetCity === city) {
        targetSelect.value = "";
        targetSelect.selectedIndex = 0;
      }
    }
  }

  // ====== UPDATE GIÁ ======
  function updatePrice() {
    if (!priceValue || !fromSelect || !toSelect) return;

    priceValue.classList.remove("airport");

    const serviceInput = document.querySelector('input[name="service"]:checked');
    const service = serviceInput ? serviceInput.value : "xe-ghep";

    // Gửi đồ
    if (service === "gui-do") {
      priceValue.textContent = "Gửi đồ: Giá theo thị trường – gọi hotline.";
      return;
    }

    const fromCity = getCity(fromSelect.value);
    const toCity = getCity(toSelect.value);

    if (!fromCity || !toCity) {
      priceValue.textContent = "Đang cập nhật...";
      return;
    }

    // ===== SÂN BAY NỘI BÀI → HẢI DƯƠNG =====
    if (fromCity === "NB" && toCity === "HD") {
      if (service === "bao-xe") {
        priceValue.textContent = "450.000 – 550.000đ (bao xe)";
      } else {
        priceValue.textContent = "150.000 – 200.000đ (ghép xe)";
      }
      return;
    }

    // ===== HÀ NỘI ⇄ HẢI DƯƠNG =====
    if (
      (fromCity === "HN" && toCity === "HD") ||
      (fromCity === "HD" && toCity === "HN")
    ) {
      if (service === "bao-xe") {
        priceValue.textContent = "450.000 – 550.000đ (bao xe)";
      } else {
        priceValue.textContent = "150.000 – 200.000đ (ghép xe)";
      }
      return;
    }

    // Nếu vì lý do nào đó vẫn chọn sai
    priceValue.textContent = "Tuyến này chưa hỗ trợ – vui lòng gọi hotline.";
  }

  // Helper: iOS đôi khi chưa cập nhật DOM kịp
  function safeUpdatePrice() {
    requestAnimationFrame(updatePrice);
    setTimeout(updatePrice, 0);
  }

  // Lắng nghe đổi dịch vụ
  const serviceRadios = document.querySelectorAll('input[name="service"]');
  if (serviceRadios.length) {
    serviceRadios.forEach(function (radio) {
      radio.addEventListener("change", safeUpdatePrice);
    });
  }

  // Lắng nghe đổi điểm đi/đến (FIX iPhone Safari)
  if (fromSelect && toSelect) {
    function onFromChanged() {
      // RESET điểm đến trước (fix iOS giữ value cũ)
      toSelect.value = "";
      toSelect.selectedIndex = 0;

      filterSelect(fromSelect, toSelect);
      safeUpdatePrice();
    }

    // iOS Safari: thêm input để chắc ăn
    fromSelect.addEventListener("change", onFromChanged);
    fromSelect.addEventListener("input", onFromChanged);

    // KHÔNG filter ngược lại khi đổi điểm đến (tránh dính state trên mobile/iOS)
    function onToChanged() {
      safeUpdatePrice();
    }
    toSelect.addEventListener("change", onToChanged);
    toSelect.addEventListener("input", onToChanged);

    // Fix iOS bfcache: quay lại trang vẫn giữ select cũ
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        fromSelect.selectedIndex = 0;
        toSelect.selectedIndex = 0;
        toSelect.value = "";
        safeUpdatePrice();
      }
    });
  }

  // ====== TAB SÂN BAY: SÂN BAY NỘI BÀI → HẢI DƯƠƠNG ======
  const tabs = document.querySelectorAll(".booking-tab");

  // Danh sách Hải Dương cho tab sân bay
  const HD_LIST = [
    { v: "HD-TPHaiDuong", t: "TP Hải Dương" },
    { v: "HD-ChiLinh", t: "Chí Linh" },
    { v: "HD-KinhMon", t: "Kinh Môn" },
    { v: "HD-KimThanh", t: "Kim Thành" },
    { v: "HD-NamSach", t: "Nam Sách" },
    { v: "HD-CamGiang", t: "Cẩm Giàng" },
    { v: "HD-BinhGiang", t: "Bình Giang" },
    { v: "HD-GiaLoc", t: "Gia Lộc" },
    { v: "HD-TuKy", t: "Tứ Kỳ" },
    { v: "HD-ThanhMien", t: "Thanh Miện" },
    { v: "HD-NinhGiang", t: "Ninh Giang" },
    { v: "HD-ThanhHa", t: "Thanh Hà" },
  ];

  function switchToAirportMode() {
    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML =
      '<option value="NB-NoiBai">Sân bay Nội Bài (HAN)</option>';
    fromSelect.value = "NB-NoiBai";
    fromSelect.disabled = true;
    fromSelect.classList.add("airport-select");

    let html = '<option value="">Chọn điểm đến</option>';
    html += '<optgroup label="Hải Dương">';
    html += HD_LIST.map((x) => `<option value="${x.v}">${x.t}</option>`).join(
      ""
    );
    html += "</optgroup>";

    toSelect.innerHTML = html;
    toSelect.value = "";
    toSelect.selectedIndex = 0;
    toSelect.disabled = false;

    safeUpdatePrice();
  }

  function switchToNormalMode() {
    // Giữ đúng hành vi dự án: reload để quay về select đầy đủ 2 tỉnh
    window.location.reload();
  }

  if (tabs && tabs.length > 0) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");

        const type = tab.dataset.type;
        if (type === "san-bay") switchToAirportMode();
        else switchToNormalMode();
      });
    });
  }

  // ====== NÚT "Xem trên bản đồ" → Google Maps ======
  const mapBtn = document.querySelector(".price-map-btn");
  if (mapBtn && fromSelect && toSelect) {
    mapBtn.addEventListener("click", function () {
      if (!fromSelect.value || !toSelect.value) {
        alert("Vui lòng chọn đầy đủ điểm đi và điểm đến trước khi xem trên bản đồ.");
        return;
      }

      const fromOption = fromSelect.options[fromSelect.selectedIndex];
      const toOption = toSelect.options[toSelect.selectedIndex];

      const fromCity = getCity(fromSelect.value);
      const toCity = getCity(toSelect.value);

      const fromName = fromOption ? fromOption.text.trim() : "";
      const toName = toOption ? toOption.text.trim() : "";

      function cityLabel(code) {
        if (code === "HN") return "Hà Nội";
        if (code === "HD") return "Hải Dương";
        if (code === "NB") return "Sân bay Nội Bài";
        return "";
      }

      const originFull =
        fromCity === "NB" ? cityLabel("NB") : `${fromName}, ${cityLabel(fromCity)}`;
      const destFull = `${toName}, ${cityLabel(toCity)}`;

      const url =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" +
        encodeURIComponent(originFull) +
        "&destination=" +
        encodeURIComponent(destFull);

      window.open(url, "_blank");
    });
  }

  // ====== CHECK MOBILE ======
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // ====== NÚT "ĐẶT XE NGAY" (header & cột cam kết) ======
  const callButtons = document.querySelectorAll(".btn-call");
  if (callButtons.length > 0) {
    callButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (isMobile()) {
          window.location.href = "tel:0945983789";
        } else {
          alert("Vui lòng gọi hotline: 0945 983 789 (qua điện thoại hoặc Zalo).");
        }
      });
    });
  }

  // ====== FLOATING CONTACT WIDGET ======
  const contactWidget = document.querySelector(".contact-widget");
  const contactToggle = document.querySelector(".contact-toggle");

  if (contactWidget && contactToggle) {
    contactToggle.addEventListener("click", function (e) {
      e.preventDefault();
      contactWidget.classList.toggle("open");
    });
  }

  // Messenger
  const btnMessenger = document.querySelector(".contact-item-messenger");
  if (btnMessenger) {
    btnMessenger.addEventListener("click", function (e) {
      e.preventDefault();
      window.open("https://m.me/ten_fanpage_cua_ban", "_blank");
    });
  }

  // Gọi update lần đầu
  safeUpdatePrice();
});
