// Teste de isolamento multi-tenant (RLS) contra o projeto Supabase de dev/staging.
//
// Entra pela API pública como cada usuário do seed (supabase/seed.sql), exatamente
// como o app fará, e confere o que cada papel consegue ver e alterar.
//
// Uso: npm run test:rls   (lê as chaves do Supabase do .env.local)
// A service role só prepara cenários que a API não permite criar (ex.: membro
// entrando sem convite); todas as verificações rodam como usuários comuns.
// NUNCA rodar contra produção: depende dos usuários de teste do seed.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY no .env.local"
  );
  process.exit(1);
}

const PASSWORD = "pipeflow123";
const ACME = "10000000-0000-4000-a000-000000000001";
const NOVA = "10000000-0000-4000-a000-000000000002";
const ANA = "00000000-0000-4000-a000-000000000001";
const CARLOS = "00000000-0000-4000-a000-000000000002";
const PEDRO = "00000000-0000-4000-a000-000000000005";
const ACME_LEAD = "20000000-0000-4000-a000-000000000001";
const NOVA_LEAD = "20000000-0000-4000-a000-000000000101";
const ANA_ACTIVITY = "40000000-0000-4000-a000-000000000001";

async function signIn(email) {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Login falhou para ${email}: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function api(token, method, path, body, { asServiceRole = false } = {}) {
  const key = asServiceRole ? serviceKey : anonKey;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${asServiceRole ? serviceKey : (token ?? anonKey)}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}

let failures = 0;
function check(description, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${description}`);
  } else {
    failures += 1;
    console.log(`  ✗ ${description}${detail ? `  →  ${JSON.stringify(detail)}` : ""}`);
  }
}

const rows = (result) => (Array.isArray(result.data) ? result.data : []);

const ana = await signIn("ana@acmevendas.com");
const carlos = await signIn("carlos@acmevendas.com");
const pedro = await signIn("pedro@agencianova.com.br");

console.log("\nVisitante sem login (anon)");
for (const table of ["workspaces", "leads", "deals", "activities", "profiles", "subscriptions"]) {
  const result = await api(null, "GET", `${table}?select=*`);
  check(`não vê ${table}`, rows(result).length === 0, result);
}
{
  const result = await api(null, "POST", "rpc/create_workspace", { workspace_name: "Hacker" });
  check("não consegue criar workspace", result.status >= 400, result);
}

console.log("\nAna (admin da Acme e da Agência Nova)");
{
  check("vê os 2 workspaces", rows(await api(ana, "GET", "workspaces?select=id")).length === 2);
  check(
    "vê os leads dos dois workspaces (14 + 2)",
    rows(await api(ana, "GET", "leads?select=id")).length === 16
  );
  check(
    "vê o convite pendente da Acme",
    rows(await api(ana, "GET", `workspace_invites?select=id&workspace_id=eq.${ACME}`)).length === 1
  );
  const demote = await api(
    ana,
    "PATCH",
    `workspace_members?workspace_id=eq.${NOVA}&user_id=eq.${ANA}`,
    { role: "membro" }
  );
  check("não pode se rebaixar sendo a única admin da Agência Nova", demote.status >= 400, demote);

  const addWithoutInvite = await api(ana, "POST", "workspace_members", {
    workspace_id: ACME,
    user_id: PEDRO,
    role: "membro",
  });
  check(
    "não adiciona alguém ao workspace sem convite",
    addWithoutInvite.status === 403,
    addWithoutInvite
  );
}

console.log("\nCarlos (membro da Acme)");
{
  const leads = rows(await api(carlos, "GET", "leads?select=workspace_id"));
  check(
    "vê só os 14 leads da Acme",
    leads.length === 14 && leads.every((lead) => lead.workspace_id === ACME),
    leads.length
  );
  const profiles = rows(await api(carlos, "GET", "profiles?select=id"));
  check(
    "vê os perfis da equipe da Acme, mas não o do Pedro",
    profiles.length === 4 && !profiles.some((profile) => profile.id === PEDRO),
    profiles.length
  );
  check(
    "não vê convites (só admin)",
    rows(await api(carlos, "GET", "workspace_invites?select=id")).length === 0
  );

  const rename = await api(carlos, "PATCH", `workspaces?id=eq.${ACME}`, { name: "Hackeado" });
  check("não renomeia o workspace", rows(rename).length === 0, rename);

  const promote = await api(
    carlos,
    "PATCH",
    `workspace_members?workspace_id=eq.${ACME}&user_id=eq.${CARLOS}`,
    { role: "admin" }
  );
  check("não se promove a admin", rows(promote).length === 0, promote);

  const invite = await api(carlos, "POST", "workspace_invites", {
    workspace_id: ACME,
    email: "intruso@x.com",
    invited_by: CARLOS,
  });
  check("não cria convite", invite.status === 403, invite);

  const upgrade = await api(carlos, "PATCH", `subscriptions?workspace_id=eq.${ACME}`, {
    plan: "free",
  });
  check("não altera a assinatura", rows(upgrade).length === 0, upgrade);

  const spoof = await api(carlos, "POST", "activities", {
    workspace_id: ACME,
    lead_id: ACME_LEAD,
    type: "nota",
    description: "Teste RLS",
    author_id: ANA,
  });
  check("não registra atividade em nome da Ana", spoof.status === 403, spoof);

  const own = await api(carlos, "POST", "activities", {
    workspace_id: ACME,
    lead_id: ACME_LEAD,
    type: "nota",
    description: "Teste RLS",
  });
  check("registra atividade como autor", own.status === 201, own);
  const ownId = rows(own)[0]?.id;
  if (ownId) {
    const reassign = await api(carlos, "PATCH", `activities?id=eq.${ownId}`, { author_id: ANA });
    check("não transfere a autoria da própria atividade", reassign.status === 403, reassign);
    const removed = await api(carlos, "DELETE", `activities?id=eq.${ownId}`);
    check("exclui a própria atividade", rows(removed).length === 1, removed);
  }

  const othersActivity = await api(carlos, "DELETE", `activities?id=eq.${ANA_ACTIVITY}`);
  check("não exclui atividade da Ana", rows(othersActivity).length === 0, othersActivity);

  const crossLead = await api(carlos, "POST", "deals", {
    workspace_id: ACME,
    lead_id: NOVA_LEAD,
    title: "Negócio cruzado",
  });
  check(
    "não vincula negócio da Acme a lead de outro workspace",
    crossLead.status >= 400,
    crossLead
  );

  const foreignOwner = await api(carlos, "POST", "leads", {
    workspace_id: ACME,
    name: "Lead teste",
    owner_id: PEDRO,
  });
  check("não define responsável de fora do workspace", foreignOwner.status === 403, foreignOwner);

  const probe = await api(carlos, "POST", "rpc/is_member_of", {
    target_workspace: NOVA,
    target_user: PEDRO,
  });
  check("não chama helpers internos de autorização via API", probe.status >= 400, probe);

  const nameChange = await api(carlos, "PATCH", `profiles?id=eq.${CARLOS}`, {
    full_name: "Carlos M.",
  });
  check("edita o próprio nome", rows(nameChange)[0]?.full_name === "Carlos M.", nameChange);
  await api(carlos, "PATCH", `profiles?id=eq.${CARLOS}`, { full_name: "Carlos Mendes" });

  const emailChange = await api(carlos, "PATCH", `profiles?id=eq.${CARLOS}`, {
    email: "ceo@acmevendas.com",
  });
  check("não altera o e-mail do perfil pela API", emailChange.status >= 400, emailChange);
}

console.log("\nPedro (membro só da Agência Nova)");
{
  const workspaces = rows(await api(pedro, "GET", "workspaces?select=id"));
  check("vê só a Agência Nova", workspaces.length === 1 && workspaces[0].id === NOVA, workspaces);
  check("vê só os 2 leads da Nova", rows(await api(pedro, "GET", "leads?select=id")).length === 2);
  check(
    "não lê um lead da Acme nem pelo ID",
    rows(await api(pedro, "GET", `leads?id=eq.${ACME_LEAD}`)).length === 0
  );
  check(
    "não vê negócios da Acme",
    rows(await api(pedro, "GET", `deals?workspace_id=eq.${ACME}`)).length === 0
  );

  const intrusion = await api(pedro, "POST", "leads", { workspace_id: ACME, name: "Intruso" });
  check("não cria lead na Acme", intrusion.status === 403, intrusion);

  const created = await api(pedro, "POST", "rpc/create_workspace", {
    workspace_name: "Workspace Teste RLS",
  });
  const newId = created.data?.id;
  check("cria workspace próprio via create_workspace()", created.status === 200 && newId, created);
  if (newId) {
    const membership = rows(
      await api(pedro, "GET", `workspace_members?workspace_id=eq.${newId}&select=role`)
    );
    check("vira admin do workspace criado", membership[0]?.role === "admin", membership);
    const subscription = rows(
      await api(pedro, "GET", `subscriptions?workspace_id=eq.${newId}&select=plan`)
    );
    check("workspace novo nasce no plano Free", subscription[0]?.plan === "free", subscription);

    // Cenário de saída/remoção: Carlos entra no workspace do Pedro (preparado pela
    // service role, já que no app isso só acontece via aceite de convite no M9).
    const addCarlos = () =>
      api(
        null,
        "POST",
        "workspace_members",
        { workspace_id: newId, user_id: CARLOS, role: "membro" },
        { asServiceRole: true }
      );
    await addCarlos();
    const leave = await api(
      carlos,
      "DELETE",
      `workspace_members?workspace_id=eq.${newId}&user_id=eq.${CARLOS}`
    );
    check("membro sai do workspace por conta própria", rows(leave).length === 1, leave);

    await addCarlos();
    const kick = await api(
      pedro,
      "DELETE",
      `workspace_members?workspace_id=eq.${newId}&user_id=eq.${CARLOS}`
    );
    check("admin remove um membro", rows(kick).length === 1, kick);

    const soleAdminLeaves = await api(
      pedro,
      "DELETE",
      `workspace_members?workspace_id=eq.${newId}&user_id=eq.${PEDRO}`
    );
    check("único admin não sai do workspace", soleAdminLeaves.status >= 400, soleAdminLeaves);

    const removed = await api(pedro, "DELETE", `workspaces?id=eq.${newId}`);
    check("admin exclui o workspace (cascata ok)", rows(removed).length === 1, removed);
  }
}

console.log(failures === 0 ? "\nTodos os testes passaram." : `\n${failures} teste(s) falharam.`);
process.exit(failures === 0 ? 0 : 1);
