const STORAGE_KEY = "hasad_courses_v1";

const SUBJECTS = [
  { id: "math", name: "الرياضيات", icon: "➗", color: "#0f766e" },
  { id: "arabic", name: "اللغة العربية", icon: "📖", color: "#b45309" },
  { id: "science", name: "العلوم", icon: "🔬", color: "#1d4ed8" },
  { id: "english", name: "اللغة الإنجليزية", icon: "🔤", color: "#7c3aed" },
  { id: "islamic", name: "التربية الإسلامية", icon: "🕌", color: "#047857" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function generateCode(subjectId) {
  const prefix = {
    math: "RYD",
    arabic: "ARB",
    science: "ELM",
    english: "ENG",
    islamic: "ISL",
  }[subjectId] || "CLS";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let extra = "";
  for (let i = 0; i < 4; i++) extra += chars[Math.floor(Math.random() * chars.length)];
  return prefix + extra;
}

function loadCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const seed = seedCourses();
  saveCourses(seed);
  return seed;
}

function saveCourses(courses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function seedCourses() {
  return [
    {
      id: "c1",
      subject: "math",
      title: "رياضيات الصف السادس — الفصل الأول",
      teacher: "أ. سالم الحارثي",
      code: "RYD6K2M",
      createdAt: Date.now() - 86400000 * 10,
      lessons: [
        {
          id: "l1",
          week: 1,
          title: "الكسور الاعتيادية والعمليات عليها",
          desc: "مراجعة مفهوم الكسر وجمع وطرح الكسور المتشابهة والمختلفة.",
          video: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        },
        {
          id: "l2",
          week: 2,
          title: "الكسور العشرية",
          desc: "تحويل الكسور الاعتيادية إلى عشرية والقيمة المكانية.",
          video: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        },
      ],
    },
    {
      id: "c2",
      subject: "arabic",
      title: "اللغة العربية — الصف الخامس",
      teacher: "أ. فاطمة الرواحي",
      code: "ARB5N8Q",
      createdAt: Date.now() - 86400000 * 8,
      lessons: [
        {
          id: "l3",
          week: 1,
          title: "أنواع الكلمة: اسم وفعل وحرف",
          desc: "تمييز أقسام الكلام مع أمثلة من النصوص.",
          video: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        },
      ],
    },
    {
      id: "c3",
      subject: "islamic",
      title: "التربية الإسلامية — الصف الرابع",
      teacher: "أ. يوسف المعولي",
      code: "ISL4P7T",
      createdAt: Date.now() - 86400000 * 5,
      lessons: [
        {
          id: "l4",
          week: 1,
          title: "أركان الإسلام",
          desc: "شرح أركان الإسلام الخمسة بأسلوب مبسط مناسب للمرحلة.",
          video: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        },
      ],
    },
  ];
}

function subjectById(id) {
  return SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];
}

function extractYouTubeId(url) {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return m[1];
  }
  return "";
}

function embedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(
    () => toast("تم نسخ الرمز: " + text),
    () => toast("انسخ الرمز يدويًا: " + text)
  );
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function initTeacher() {
  const form = document.getElementById("course-form");
  const lessonForm = document.getElementById("lesson-form");
  const list = document.getElementById("courses-list");
  const subjectSelect = document.getElementById("subject");
  const courseSelect = document.getElementById("lesson-course");

  SUBJECTS.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.icon + " " + s.name;
    subjectSelect.appendChild(opt);
  });

  function render() {
    const courses = loadCourses();
    list.innerHTML = "";
    courseSelect.innerHTML = "";
    if (!courses.length) {
      list.innerHTML = `<div class="empty">لا توجد حصص بعد. أنشئ شعبة جديدة بالأعلى.</div>`;
    }
    courses
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((c) => {
        const sub = subjectById(c.subject);
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
          <div class="course-head">
            <div>
              <span class="badge">${sub.icon} ${sub.name}</span>
              <h3 style="margin-top:8px">${c.title}</h3>
              <p class="meta">المعلم: ${c.teacher || "غير محدد"} · ${c.lessons.length} حصة أسبوعية</p>
            </div>
          </div>
          <div class="code-box">
            <span>${c.code}</span>
            <button class="btn btn-accent btn-sm" data-copy="${c.code}">نسخ الرمز</button>
          </div>
          <div class="list">
            ${
              c.lessons.length
                ? c.lessons
                    .slice()
                    .sort((a, b) => a.week - b.week)
                    .map(
                      (l) => `
              <div class="lesson-card" style="padding:12px 14px">
                <strong>الأسبوع ${l.week}: ${l.title}</strong>
                <p class="meta">${l.desc || ""}</p>
                <div class="actions" style="margin-top:8px">
                  <button class="btn btn-ghost btn-sm" data-preview="${c.id}:${l.id}">معاينة</button>
                  <button class="btn btn-danger btn-sm" data-del-lesson="${c.id}:${l.id}">حذف الحصة</button>
                </div>
              </div>`
                    )
                    .join("")
                : `<p class="meta">لم تُضف حصص أسبوعية بعد.</p>`
            }
          </div>
          <div class="actions">
            <button class="btn btn-danger btn-sm" data-del="${c.id}">حذف الشعبة</button>
          </div>
        `;
        list.appendChild(card);

        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${sub.name} — ${c.title} (${c.code})`;
        courseSelect.appendChild(opt);
      });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const courses = loadCourses();
    const subject = document.getElementById("subject").value;
    const title = document.getElementById("title").value.trim();
    const teacher = document.getElementById("teacher").value.trim();
    if (!title) return toast("أدخل عنوان الشعبة");
    const course = {
      id: uid(),
      subject,
      title,
      teacher,
      code: generateCode(subject),
      createdAt: Date.now(),
      lessons: [],
    };
    courses.push(course);
    saveCourses(courses);
    form.reset();
    render();
    toast("تم إنشاء الشعبة. الرمز: " + course.code);
  });

  lessonForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const courses = loadCourses();
    const cid = document.getElementById("lesson-course").value;
    const course = courses.find((c) => c.id === cid);
    if (!course) return toast("اختر شعبة أولاً");
    const week = Number(document.getElementById("week").value);
    const title = document.getElementById("lesson-title").value.trim();
    const desc = document.getElementById("lesson-desc").value.trim();
    const video = document.getElementById("video").value.trim();
    if (!title || !video) return toast("أكمل عنوان الحصة ورابط الفيديو");
    if (!extractYouTubeId(video)) return toast("ضع رابط يوتيوب صحيح");
    course.lessons.push({
      id: uid(),
      week: week || course.lessons.length + 1,
      title,
      desc,
      video,
    });
    saveCourses(courses);
    lessonForm.reset();
    render();
    toast("تمت إضافة الحصة الأسبوعية");
  });

  list.addEventListener("click", (e) => {
    const copy = e.target.closest("[data-copy]");
    const del = e.target.closest("[data-del]");
    const delL = e.target.closest("[data-del-lesson]");
    const prev = e.target.closest("[data-preview]");
    if (copy) copyText(copy.getAttribute("data-copy"));
    if (del) {
      const id = del.getAttribute("data-del");
      const courses = loadCourses().filter((c) => c.id !== id);
      saveCourses(courses);
      render();
      toast("تم حذف الشعبة");
    }
    if (delL) {
      const [cid, lid] = delL.getAttribute("data-del-lesson").split(":");
      const courses = loadCourses();
      const c = courses.find((x) => x.id === cid);
      if (c) c.lessons = c.lessons.filter((l) => l.id !== lid);
      saveCourses(courses);
      render();
      toast("تم حذف الحصة");
    }
    if (prev) {
      const [cid, lid] = prev.getAttribute("data-preview").split(":");
      location.href = `classroom.html?code=${encodeURIComponent(
        loadCourses().find((c) => c.id === cid).code
      )}&lesson=${lid}`;
    }
  });

  render();
}

function initJoin() {
  const form = document.getElementById("join-form");
  const input = document.getElementById("code-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = (input.value || "").trim().toUpperCase();
    const course = loadCourses().find((c) => c.code.toUpperCase() === code);
    if (!course) {
      toast("الرمز غير صحيح. تأكد من الرمز الذي أعطاك إياه المعلم.");
      return;
    }
    location.href = "classroom.html?code=" + encodeURIComponent(course.code);
  });
}

function initClassroom() {
  const code = (qs("code") || "").toUpperCase();
  const lessonId = qs("lesson");
  const course = loadCourses().find((c) => c.code.toUpperCase() === code);
  const root = document.getElementById("classroom");
  if (!course) {
    root.innerHTML = `
      <div class="panel join-box">
        <h2>الرمز غير موجود</h2>
        <p class="hint">تحقق من الرمز أو اطلب رمزًا جديدًا من معلمك.</p>
        <a class="btn btn-primary" href="join.html">العودة لإدخال الرمز</a>
      </div>`;
    return;
  }
  const sub = subjectById(course.subject);
  const lessons = course.lessons.slice().sort((a, b) => a.week - b.week);
  const active = lessons.find((l) => l.id === lessonId) || lessons[0];

  root.innerHTML = `
    <div class="panel" style="margin-bottom:18px">
      <span class="badge">${sub.icon} ${sub.name}</span>
      <h2 style="margin-top:10px">${course.title}</h2>
      <p class="meta">المعلم: ${course.teacher || "—"} · رمز الدخول: <strong>${course.code}</strong></p>
    </div>
    ${
      active
        ? `<div class="panel" style="margin-bottom:18px">
            <h3>الأسبوع ${active.week}: ${active.title}</h3>
            <p class="hint">${active.desc || ""}</p>
            ${
              embedUrl(active.video)
                ? `<div class="video-wrap"><iframe src="${embedUrl(active.video)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="${active.title}"></iframe></div>`
                : `<div class="empty">لا يمكن تشغيل الفيديو. تحقق من الرابط.</div>`
            }
          </div>`
        : `<div class="panel empty">لم يُضف المعلم حصصًا أسبوعية بعد.</div>`
    }
    <div class="panel">
      <h3>الحصص الأسبوعية</h3>
      <div class="list" style="margin-top:12px">
        ${
          lessons.length
            ? lessons
                .map(
                  (l) => `
          <a class="lesson-card" href="classroom.html?code=${encodeURIComponent(course.code)}&lesson=${l.id}" style="display:block;${l.id === (active && active.id) ? "border-color:#14b8a6;background:#f0fdfa" : ""}">
            <strong>الأسبوع ${l.week} — ${l.title}</strong>
            <p class="meta">${l.desc || "حصة مرئية داخل الموقع"}</p>
          </a>`
                )
                .join("")
            : `<p class="meta">لا توجد حصص حتى الآن.</p>`
        }
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "teacher") initTeacher();
  if (page === "join") initJoin();
  if (page === "classroom") initClassroom();
});
