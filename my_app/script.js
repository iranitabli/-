// ===== ذخیره و خروج =====
function saveAndExit() {
  var name = document.getElementById("lesson-name").value;
  var topic = document.getElementById("lesson-topic").value;
  var date = document.getElementById("lesson-date").value;
  var question = document.getElementById("lesson-question").value;

  if (name === "" || topic === "" || date === "") {
    alert("لطفاً فیلدهای ستاره‌دار رو پر کن!");
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  alert("⚠️ لطفاً تاریخ را به صورت میلادی وارد کنید (مثلاً 2026-09-28)");
  return;
}
var gregorianDate = shamsiToGregorian(date);
var lesson = {
  id: Date.now(),
  userId: localStorage.getItem("currentUser"), 
  name: name,
  topic: topic,
  date: date,  // تاریخ شمسی برای نمایش
  timestamp: new Date(gregorianDate + "T00:00:00").getTime(),
  question: question
};
  
  // ذخیره در فایل JSON از طریق سرور
  fetch("http://localhost:8000/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lesson)
  }).then(function() {
    alert("درس با موفقیت ثبت شد! ✅");
    window.location.href = "index.html";
  });
}

// ===== نمایش درس‌ها =====
function loadLessons() {
  var currentUser = localStorage.getItem("currentUser");
  fetch("http://localhost:8000/lessons?userId=" + currentUser)
    .then(function(res) { return res.json(); })
    .then(function(lessons) {
      var list = document.getElementById("lesson-list");

      if (lessons.length === 0) {
        list.innerHTML = "<p class='empty'>هنوز درسی ثبت نشده. از دکمه بالا شروع کن! 🌱</p>";
        return;
      }

      var html = "";
      for (var i = 0; i < lessons.length; i++) {
        var l = lessons[i];
        html += "<div class='lesson-card'>";
        html += "<h3>" + l.name + "</h3>";
        html += "<p>موضوع: " + l.topic + "</p>";
        html += "<p>تاریخ: " + l.date + "</p>";
        var days = daysSince(l.timestamp);
        var daysText = days === 0 ? "امروز" : days + " روز پیش";
        html += "<p class='days'>⏱️ " + daysText + "</p>";
        html += "<p class='status'>📌 " + getReviewStatus(l.timestamp) + "</p>";
        if (l.question) {
          html += "<p class='q'>❓ " + l.question + "</p>";
        }
        html += "<div class='card-actions'>";
        html += "<button onclick='editLesson(" + l.id + ")'>✏️ ویرایش</button>";
        html += "<button onclick='deleteLesson(" + l.id + ")' class='btn-del'>🗑️ حذف</button>";
        html += "</div></div>";
      }
      list.innerHTML = html;
    });
}

// ===== محاسبه روزهای گذشته از تاریخ ثبت =====
function daysSince(timestamp) {
  var now = Date.now();
  var diff = now - timestamp;
  return Math.floor(diff / (24 * 3600 * 1000));
}

// ===== حذف درس =====
function deleteLesson(id) {
  if (!confirm("این درس حذف بشه؟")) return;
  fetch("http://localhost:8000/lessons/" + id, {
    method: "DELETE"
  }).then(function() {
    loadLessons();
  });
}

// ===== ویرایش درس =====
function editLesson(id) {
  fetch("http://localhost:8000/lessons/" + id)
    .then(function(res) { return res.json(); })
    .then(function(lesson) {
      if (!lesson) return;

      document.getElementById("lesson-name").value = lesson.name;
      document.getElementById("lesson-topic").value = lesson.topic;
      document.getElementById("lesson-date").value = lesson.date;
      document.getElementById("lesson-question").value = lesson.question;

      localStorage.setItem("editingId", id);
      document.getElementById("modal").classList.remove("hidden");
    });
}

// ===== ذخیره ویرایش =====
function saveEdit() {
  var id = parseInt(localStorage.getItem("editingId"));
  var name = document.getElementById("lesson-name").value;
  var topic = document.getElementById("lesson-topic").value;
  var date = document.getElementById("lesson-date").value;
  var question = document.getElementById("lesson-question").value;

  fetch("http://localhost:8000/lessons/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      topic: topic,
      date: date,
      timestamp: new Date(shamsiToGregorian(date) + "T00:00:00").getTime(),
      question: question
    })
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  alert("⚠️ لطفاً تاریخ را به صورت میلادی وارد کنید (مثلاً 2026-09-28)");
  return;
}
  }).then(function() {
    localStorage.removeItem("editingId");
    alert("ویرایش ذخیره شد! ✅");
    window.location.href = "index.html";
  });
}

// ===== لیست جمله‌های انگیزشی (قابل تغییر) =====
var motivationalQuotes = [
  "مرور، کلید موندگاریه! 🧠",
  "هر روز یه قدم به موفقیت نزدیک‌تر! 🌱",
  "تکرار، مادر مهارته! 💪",
  "ذهن قوی، با مرور ساخته می‌شه! ✨",
  "امروز بهترین روز برای مروره! 🌟",
  "یادگیری واقعی، با مرور اتفاق می‌افته! 📚"
];

// ===== زمان‌های طلایی =====
function getGoldenTimes(dateStr) {
  var base = new Date(dateStr + "T00:00:00");
  return {
    "24 ساعت": new Date(base.getTime() + 24 * 3600 * 1000),
    "72 ساعت": new Date(base.getTime() + 72 * 3600 * 1000),
    "1 هفته": new Date(base.getTime() + 7 * 24 * 3600 * 1000),
    "2-3 هفته": new Date(base.getTime() + 17 * 24 * 3600 * 1000),
    "1 ماه": new Date(base.getTime() + 30 * 24 * 3600 * 1000),
    "1 سال": new Date(base.getTime() + 365 * 24 * 3600 * 1000)
  };
}

// ===== وضعیت مرور بر اساس روزهای گذشته =====
function getReviewStatus(timestamp) {
  var days = daysSince(timestamp);
  var stages = [
    { name: "۲۴ ساعت", min: 1, max: 1 },
    { name: "۷۲ ساعت", min: 2, max: 3 },
    { name: "۱ هفته", min: 4, max: 7 },
    { name: "۲-۳ هفته", min: 8, max: 21 },
    { name: "۱ ماه", min: 22, max: 30 },
    { name: "۱ سال", min: 31, max: 365 }
  ];

  for (var i = 0; i < stages.length; i++) {
    if (days >= stages[i].min && days <= stages[i].max) {
      return "در مرحله " + stages[i].name;
    }
  }
  return days > 365 ? "مرور سالانه گذشته!" : "هنوز زمان مرور نرسیده";
}

// ===== اعلان مرورگر =====
function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

function scheduleNotifications() {
  fetch("http://localhost:8000/lessons")
    .then(function(res) { return res.json(); })
    .then(function(lessons) {
      var now = Date.now();

      lessons.forEach(function(l) {
        var times = getGoldenTimes(shamsiToGregorian(l.date));
        for (var key in times) {
          var t = times[key].getTime();
          [t - 2 * 3600 * 1000, t].forEach(function(notifTime) {
            var delay = notifTime - now;
            if (delay > 0) {
              setTimeout(function() {
                var quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
var msg = (l.question ? l.question + " — " : "") + quote;
                new Notification("⏰ یادآوری مرور", {
                  body: msg,
                  icon: "📚"
                });
              }, delay);
            }
          });
        }
      });
    });
}

// ===== راه‌اندازی =====
document.addEventListener("DOMContentLoaded", function() {
  loadLessons();
  requestNotificationPermission();
  scheduleNotifications();
});
// ===== تبدیل تاریخ میلادی به شمسی =====
function toShamsi(dateStr) {
  var d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fa-IR");
}
// ===== بستن مودال =====
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
// ===== تبدیل تاریخ شمسی به میلادی =====
function shamsiToGregorian(shamsiStr) {
  var parts = shamsiStr.split("/");
  var jy = parseInt(parts[0]);
  var jm = parseInt(parts[1]);
  var jd = parseInt(parts[2]);

  // الگوریتم تبدیل جلالی به میلادی
  var gy = jy + 621;
  var leapJ = -14;
  var jp = 82;
  if (jy < 0) jy += 1;

  var jm2 = jm - 1;
  var leapJ2 = (jy % 33) * 4;
  if (leapJ2 > 4) leapJ2 = 4;
  var leapG = (gy % 4) * 4;
  if (leapG > 4) leapG = 4;
  var march = 20 + leapJ2 - leapG;
  if (leapJ < jm2) jm2 += 1;

  var jdn = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm2 * 19 + 15) / 33) * 1;
  jdn = Math.floor(jdn);

  var g = jdn + 32044;
  var q = Math.floor(4 * g / 146097);
  var r = g - Math.floor((146097 * q) / 4);
  var gy2 = Math.floor((4 * r + 3) / 1461);
  var r2 = r - Math.floor((1461 * gy2) / 4);
  var gm = Math.floor((5 * r2 + 2) / 153);
  var gd = r2 - Math.floor((153 * gm + 2) / 5) + 1;
  gy2 = gy2 + 100 * q;

  if (gm > 12) {
    gm -= 12;
    gy2 += 1;
  }

  return gy2 + "-" + (gm < 10 ? "0" : "") + gm + "-" + (gd < 10 ? "0" : "") + gd;
}
// ===== ثبت‌نام =====
function register() {
  var username = document.getElementById("reg-username").value;
  var password = document.getElementById("reg-password").value;

  if (!username || !password) {
    alert("نام کاربری و رمز رو وارد کن!");
    return;
  }

  // چک کن کاربر قبلاً ثبت نشده باشه
  fetch("http://localhost:8000/users?username=" + username)
    .then(function(res) { return res.json(); })
    .then(function(users) {
      if (users.length > 0) {
        alert("این نام کاربری قبلاً ثبت شده!");
        return;
      }
      // ثبت کاربر جدید
      fetch("http://localhost:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      }).then(function() {
        localStorage.setItem("currentUser", username);
        alert("ثبت‌نام موفق! خوش اومدی " + username + " 🌹");
        window.location.href = "index.html";
      });
    });
}

// ===== ورود =====
function login() {
  var username = document.getElementById("login-username").value;
  var password = document.getElementById("login-password").value;

  fetch("http://localhost:8000/users?username=" + username + "&password=" + password)
    .then(function(res) { return res.json(); })
    .then(function(users) {
      if (users.length === 0) {
        alert("نام کاربری یا رمز اشتباهه!");
        return;
      }
      localStorage.setItem("currentUser", username);
      alert("خوش اومدی " + username + " 🌹");
      window.location.href = "index.html";
    });
}

// ===== خروج =====
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
