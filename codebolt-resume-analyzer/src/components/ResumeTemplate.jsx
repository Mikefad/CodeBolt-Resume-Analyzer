const safeArray = value => (Array.isArray(value) ? value : []);
const safeText = value => (typeof value === 'string' ? value : '');

function formatDateRange(start, end) {
  const safeStart = safeText(start);
  const safeEnd = safeText(end);
  if (!safeStart && !safeEnd) return '';
  if (safeStart && safeEnd) return `${safeStart} - ${safeEnd}`;
  return safeStart || safeEnd;
}

export function buildResumePrintHtml(data) {
  const contact = data?.contact ?? {};
  const links = safeArray(contact.links);
  const skills = safeArray(data?.skills);
  const certifications = safeArray(data?.certifications);
  const education = safeArray(data?.education);
  const experience = safeArray(data?.experience);
  const projects = safeArray(data?.projects);

  const linkItems = links.map(link => `<li>${link}</li>`).join('');
  const skillItems = skills.map(skill => `<li>${skill}</li>`).join('');
  const certItems = certifications.map(cert => `<li>${cert}</li>`).join('');
  const educationItems = education
    .map((item) => {
      const details = safeArray(item.details)
        .map(detail => `<li>${detail}</li>`)
        .join('');
      return `
        <div class="block">
          <div class="title">${safeText(item.degree)}</div>
          <div class="subtitle">${safeText(item.school)}${item.location ? ` - ${safeText(item.location)}` : ''}</div>
          <div class="meta">${formatDateRange(item.start, item.end)}</div>
          ${details ? `<ul>${details}</ul>` : ''}
        </div>
      `;
    })
    .join('');

  const experienceItems = experience
    .map((item) => {
      const bullets = safeArray(item.bullets)
        .map(bullet => `<li>${bullet}</li>`)
        .join('');
      return `
        <div class="block">
          <div class="title">${safeText(item.role)}</div>
          <div class="subtitle">${safeText(item.company)}${item.location ? ` - ${safeText(item.location)}` : ''}</div>
          <div class="meta">${formatDateRange(item.start, item.end)}</div>
          ${bullets ? `<ul>${bullets}</ul>` : ''}
        </div>
      `;
    })
    .join('');

  const projectItems = projects
    .map((item) => {
      const bullets = safeArray(item.bullets)
        .map(bullet => `<li>${bullet}</li>`)
        .join('');
      return `
        <div class="block">
          <div class="title">${safeText(item.name)}</div>
          <div class="subtitle">${safeText(item.description)}</div>
          ${bullets ? `<ul>${bullets}</ul>` : ''}
        </div>
      `;
    })
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeText(data?.fullName)} - Resume</title>
    <style>
      * { box-sizing: border-box; }
      @page { size: A4; margin: 10mm; }
      body {
        margin: 0;
        font-family: "Georgia", "Times New Roman", serif;
        color: #111827;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        display: grid;
        grid-template-columns: 1fr 2fr;
        height: 277mm;
        width: 190mm;
        margin: 0 auto;
      }
      .sidebar { background: #f7e1f4; padding: 18px 16px; }
      .main { padding: 18px 20px; }
      h1 { font-size: 22px; letter-spacing: 0.02em; margin: 0 0 6px; }
      h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.28em; margin: 18px 0 6px; }
      .divider { border-top: 2px solid #111827; margin: 6px 0 12px; }
      .label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #374151; margin: 12px 0 6px; }
      .muted { color: #4b5563; font-size: 11px; line-height: 1.35; }
      .block { margin-bottom: 12px; break-inside: avoid; }
      .title { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
      .subtitle { font-size: 11px; color: #374151; margin-top: 3px; }
      .meta { font-size: 10px; color: #6b7280; margin-top: 3px; }
      ul { padding-left: 14px; margin: 6px 0 0; }
      li { font-size: 11px; margin-bottom: 4px; line-height: 1.35; word-break: break-word; }
    </style>
  </head>
  <body>
    <div class="page">
      <aside class="sidebar">
        <div class="label">Contact</div>
        <ul>
          ${safeText(contact.email) ? `<li>${safeText(contact.email)}</li>` : ''}
          ${safeText(contact.phone) ? `<li>${safeText(contact.phone)}</li>` : ''}
          ${safeText(contact.location) ? `<li>${safeText(contact.location)}</li>` : ''}
          ${linkItems}
        </ul>
        ${educationItems ? `<div class="label">Education</div>${educationItems}` : ''}
        ${skills.length ? `<div class="label">Skills</div><ul>${skillItems}</ul>` : ''}
        ${certifications.length ? `<div class="label">Certifications</div><ul>${certItems}</ul>` : ''}
      </aside>
      <main class="main">
        <h1>${safeText(data?.fullName)}</h1>
        <div class="muted">${safeText(data?.headline)}</div>
        <div class="divider"></div>
        <div class="label">Summary</div>
        <div class="muted">${safeText(data?.summary)}</div>
        ${experienceItems ? `<div class="label">Experience</div>${experienceItems}` : ''}
        ${projectItems ? `<div class="label">Projects</div>${projectItems}` : ''}
      </main>
    </div>
  </body>
</html>`;
}

export default function ResumeTemplate({ data }) {
  const contact = data?.contact ?? {};
  const links = safeArray(contact.links);
  const skills = safeArray(data?.skills);
  const certifications = safeArray(data?.certifications);
  const education = safeArray(data?.education);
  const experience = safeArray(data?.experience);
  const projects = safeArray(data?.projects);

  return (
    <div className="grid w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-[0.95fr_2.05fr]">
      <aside className="min-w-0 bg-rose-50/80 px-6 py-6 text-sm text-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Contact</p>
        <ul className="mt-3 space-y-2 break-words text-sm">
          {contact.email ? <li>{contact.email}</li> : null}
          {contact.phone ? <li>{contact.phone}</li> : null}
          {contact.location ? <li>{contact.location}</li> : null}
          {links.map(link => (
            <li key={link}>{link}</li>
          ))}
        </ul>

        {education.length ? (
          <div className="mt-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Education</p>
            {education.map((item, index) => (
              <div key={`${item.school}-${index}`} className="text-sm text-slate-700">
                <p className="font-semibold uppercase tracking-wide text-slate-800">{safeText(item.degree)}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {safeText(item.school)}
                  {item.location ? ` - ${safeText(item.location)}` : ''}
                </p>
                {formatDateRange(item.start, item.end) ? (
                  <p className="mt-1 text-xs text-slate-500">{formatDateRange(item.start, item.end)}</p>
                ) : null}
                {safeArray(item.details).length ? (
                  <ul className="mt-2 list-disc pl-4 text-xs text-slate-600">
                    {safeArray(item.details).map(detail => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {skills.length ? (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Skills</p>
            <ul className="mt-3 list-disc pl-5 text-xs text-slate-700">
              {skills.map(skill => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {certifications.length ? (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Certifications</p>
            <ul className="mt-3 list-disc pl-5 text-xs text-slate-700">
              {certifications.map(cert => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>

      <main className="min-w-0 px-8 py-6 text-slate-900">
        <h2 className="text-xl font-semibold uppercase tracking-wide">{safeText(data?.fullName)}</h2>
        <p className="mt-1 text-sm text-slate-600">{safeText(data?.headline)}</p>
        <div className="mt-4 h-0.5 w-full bg-slate-900" />

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Summary</p>
          <p className="mt-2 text-sm text-slate-700">{safeText(data?.summary)}</p>
        </section>

        {experience.length ? (
          <section className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Experience</p>
            {experience.map((item, index) => (
              <div key={`${item.company}-${index}`}>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-800">{safeText(item.role)}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {safeText(item.company)}
                  {item.location ? ` - ${safeText(item.location)}` : ''}
                </p>
                {formatDateRange(item.start, item.end) ? (
                  <p className="mt-1 text-xs text-slate-500">{formatDateRange(item.start, item.end)}</p>
                ) : null}
                {safeArray(item.bullets).length ? (
                  <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
                    {safeArray(item.bullets).map(bullet => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {projects.length ? (
          <section className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Projects</p>
            {projects.map((item, index) => (
              <div key={`${item.name}-${index}`}>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-800">{safeText(item.name)}</p>
                <p className="mt-1 text-xs text-slate-600">{safeText(item.description)}</p>
                {safeArray(item.bullets).length ? (
                  <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
                    {safeArray(item.bullets).map(bullet => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
