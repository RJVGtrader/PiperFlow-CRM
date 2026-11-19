import { Resend } from "resend";

import type { MemberRole } from "@/types/workspace";

interface InviteEmail {
  to: string;
  workspaceName: string;
  invitedByName: string;
  role: MemberRole;
  inviteUrl: string;
}

const roleLabels: Record<MemberRole, string> = { admin: "admin", membro: "membro" };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Envia o convite via Resend. Retorna false (sem lançar) quando o Resend não
 * está configurado ou o envio falha: o convite já existe no banco e o admin
 * pode copiar o link manualmente.
 */
export async function sendInviteEmail(invite: InviteEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const workspace = escapeHtml(invite.workspaceName);
  const invitedBy = escapeHtml(invite.invitedByName);

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: invite.to,
      subject: `${invite.invitedByName} convidou você para ${invite.workspaceName} no PipeFlow CRM`,
      text: [
        `${invite.invitedByName} convidou você para entrar no workspace ${invite.workspaceName} no PipeFlow CRM como ${roleLabels[invite.role]}.`,
        "",
        `Aceite o convite: ${invite.inviteUrl}`,
        "",
        "O link expira em 7 dias. Se você não esperava este convite, ignore este e-mail.",
      ].join("\n"),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
          <h1 style="font-size: 20px; margin-bottom: 8px;">Você foi convidado para ${workspace}</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            ${invitedBy} convidou você para entrar no workspace <strong>${workspace}</strong>
            no PipeFlow CRM como <strong>${roleLabels[invite.role]}</strong>.
          </p>
          <p style="margin: 24px 0;">
            <a href="${escapeHtml(invite.inviteUrl)}" style="background: #111827; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Aceitar convite
            </a>
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            O link expira em 7 dias. Se você não esperava este convite, ignore este e-mail.
          </p>
        </div>
      `,
    });
    if (error) {
      console.error("Falha ao enviar convite via Resend:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Falha ao enviar convite via Resend:", error);
    return false;
  }
}
