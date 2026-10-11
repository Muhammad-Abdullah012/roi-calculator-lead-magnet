export interface ReportMetric {
  label: string;
  formatted: string;
}

export interface ReportEmailData {
  brandName: string;
  recipientName?: string;
  reportTitle: string;
  intro: string;
  metrics: ReportMetric[];
  ctaLabel: string;
  ctaUrl: string;
  footerNote?: string;
  accent?: string;
  primary?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReportEmail(data: ReportEmailData): {
  subject: string;
  html: string;
} {
  const primary = data.primary ?? "#4f46e5";
  const rows = data.metrics
    .map(
      (metric) => `
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">${escapeHtml(metric.label)}</td>
          <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:16px;font-weight:700;text-align:right;">${escapeHtml(metric.formatted)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(data.reportTitle)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:18px;font-weight:700;color:${primary};">${escapeHtml(data.brandName)}</span>
      </div>
      <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:${primary};padding:28px 24px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">${escapeHtml(data.reportTitle)}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
            ${escapeHtml(data.recipientName ? `Hi ${data.recipientName}, ` : "")}${escapeHtml(data.intro)}
          </p>
          <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            ${rows}
          </table>
          <div style="text-align:center;margin-top:28px;">
            <a href="${escapeHtml(data.ctaUrl)}" style="display:inline-block;background:${primary};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">${escapeHtml(data.ctaLabel)}</a>
          </div>
        </div>
      </div>
      ${
        data.footerNote
          ? `<p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">${escapeHtml(data.footerNote)}</p>`
          : ""
      }
    </div>
  </body>
</html>`;

  return { subject: data.reportTitle, html };
}
