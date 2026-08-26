import { api, auth } from '@appdeploy/client';
import './university.css';
import { evaluateLessonAnswer, lessonAccessViewModel, lessonAttemptFeedback, lessonFeedbackViewModel } from './lesson-feedback';
import { T, AREAS, MATERIAL_SOURCES, sourceRefs, AUDIT_ROWS, LEVEL_MATRIX, CONTENT, CALIBRATION_BANK, LEVEL_GUIDE, selectQuestions } from './curriculum';
import { accountMismatchMessage, destinationAfterAuthentication, googleLoginError, loginMethod, shouldRecoverWithGoogle } from './auth-flow';
import { competencySummary, getNextLearningAction, getProgressLabel, type LearningUnit } from './learning-state';
import { navigationItems } from './navigation-model';
import { selectSupportExcerpt } from './support-selector';
import { progressMetrics } from './progress-metrics';
import { nextDiagnosticLevel, canAccessAdmin as canAccessAdminRole, canManageRoles as canManageRolesRule } from './rules';
import { SUPPORT_MATERIALS } from './support-materials';
import { adminFailureDetail, adminGroupLabel, educationRoleLabel } from './admin-rh-model';
type UnitState = {
    status: 'practice' | 'consolidated' | 'review' | 'pending_review';
    attempts: number;
    correct: number;
    errors?: number;
    hints?: number;
    durationSec?: number;
    questionStats?: Array<{
        attempts: number;
        errors: number;
    }>;
    reviewStage?: number;
    reviewCount?: number;
    intervalDays?: number;
    completedAt?: string;
    nextReviewAt?: string;
    updatedAt?: string;
};
type P = {
    name: string;
    email?: string | null;
    jobRole: string;
    role?: 'superadmin' | 'admin' | 'rh' | 'gestor' | 'colaborador';
    level: string | null;
    skillLevels?: Record<string, string>;
    progress: number;
    completedUnits?: string[];
    unitProgress?: Record<string, UnitState>;
    diagnosticCompletedAt: string | null;
    lastActivityAt?: string | null;
    mustChangePassword: boolean;
};
let me: {
    participant: P;
} | null = null;
const S = 'mh-edu-session', L = ['N1', 'N2', 'N3', 'N4', 'N5'];
const tok = () => localStorage.getItem(S) || '', done = () => new Set(me?.participant.completedUnits || []), admin = () => canAccessAdminRole(me?.participant.role), canManageRoles = () => canManageRolesRule(me?.participant.role), all = () => T.flatMap(t => L.map((l, i) => ({ id: t[0] + '-' + l, t: t[0], n: t[1], i: t[2], l, k: i + 1 })));
function say(x: string) { let e = document.getElementById('eduToast'); if (!e) {
    e = document.createElement('div');
    e.id = 'eduToast';
    document.body.append(e);
} e.textContent = x; e.className = 'edu-toast show'; setTimeout(() => e?.classList.remove('show'), 2500); }
function message(x: unknown) { const q = x as {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
    };
    message?: string;
    code?: string;
}; return q.response?.data?.error || q.response?.data?.message || q.message || q.code || 'Não foi possível concluir o acesso.'; }
function ui(title: string, h: string, a = 'inicio') { const nav = navigationItems({ diagnosticCompleted: !!me?.participant.diagnosticCompletedAt, role: me?.participant.role }); document.body.className = 'edu-body'; document.body.innerHTML = '<div class="edu-app"><aside class="edu-side"><div class="edu-brand"><b>MH</b><span>INSTALAÇÕES<br>HIDRÁULICAS</span></div><nav aria-label="Navegação principal">' + nav.map(x => '<button data-nav="' + x.id + '" class="' + (a === x.id ? 'active' : '') + '" ' + (a === x.id ? 'aria-current="page"' : '') + '>' + x.label + '</button>').join('') + '</nav></aside><main><header class="edu-top"><strong>' + title + '</strong><span>' + me?.participant.name + '<small>' + me?.participant.jobRole + '</small></span></header><section class="edu-content">' + h + '</section></main></div><div id="eduToast" class="edu-toast" role="status" aria-live="polite"></div>'; document.querySelectorAll<HTMLElement>('[data-nav]').forEach(x => x.onclick = () => go(x.dataset.nav || 'inicio')); }
function afterAuth() { if (!me)
    return login(); const destination = destinationAfterAuthentication(me.participant); if (destination === 'password-change')
    return passwordChange(); if (destination === 'welcome')
    return welcome(); if (destination === 'journey')
    return journey(); home(); }
async function googleSession() { const r = await api.get('/api/edu/email/session'); localStorage.setItem(S, r.data.token); me = { participant: r.data.participant }; afterAuth(); }
async function mount() { let expired = false; if (tok()) {
    try {
        me = (await api.post('/api/edu/me', { token: tok() })).data;
        return afterAuth();
    }
    catch {
        localStorage.removeItem(S);
        expired = true;
    }
} if (shouldRecoverWithGoogle(auth.isSignedIn())) {
    try {
        return await googleSession();
    }
    catch (x) {
        return login(googleLoginError(x));
    }
} login(expired ? 'Sua sessão expirou. Entre novamente para continuar de onde parou.' : ''); }
function passwordChange() { document.body.className = 'edu-body'; document.body.innerHTML = '<div class="edu-login"><div><h1>Crie sua nova senha</h1><p>Por segurança, a senha provisória precisa ser alterada antes de acessar a Universidade.</p><label>Nova senha<input id="newPw" type="password" autocomplete="new-password"></label><label>Confirmar nova senha<input id="confirmPw" type="password" autocomplete="new-password"></label><button id="savePw" class="edu-primary">Salvar e continuar</button></div></div><div id="eduToast" class="edu-toast"></div>'; document.getElementById('savePw')?.addEventListener('click', async () => { const next = (document.getElementById('newPw') as HTMLInputElement).value, confirm = (document.getElementById('confirmPw') as HTMLInputElement).value; if (next.length < 8)
    return say('Use ao menos 8 caracteres.'); if (next !== confirm)
    return say('As senhas não coincidem.'); try {
    await api.post('/api/edu/password', { token: tok(), password: next });
    if (me)
        me.participant.mustChangePassword = false;
    afterAuth();
}
catch (x) {
    say(message(x));
} }); }
function login(errorText = '') { document.body.className = 'edu-body'; document.body.innerHTML = '<div class="edu-login"><div><h1>Universidade Empresarial</h1><p id="loginFeedback" class="edu-login-feedback" role="alert"></p><p id="loginHint">Use seu celular e senha ou escolha o acesso pelo Google.</p><label>E-mail ou celular<input id="id" autocomplete="username"></label><label id="pwRow">Senha<input id="pw" type="password" autocomplete="current-password"></label><button id="go" class="edu-primary">Entrar</button><button id="ad" class="edu-secondary">Entrar com Google</button></div></div>'; const input = document.getElementById('id') as HTMLInputElement, pwRow = document.getElementById('pwRow') as HTMLElement, goBtn = document.getElementById('go') as HTMLButtonElement, hint = document.getElementById('loginHint') as HTMLElement, feedback = document.getElementById('loginFeedback') as HTMLElement; const showError = (value: string) => { feedback.textContent = value; feedback.style.display = value ? 'block' : 'none'; }; showError(errorText); const update = () => { const method = loginMethod(input.value); pwRow.style.display = method === 'google' ? 'none' : 'grid'; goBtn.textContent = method === 'google' ? 'Continuar com Google' : 'Entrar'; hint.textContent = method === 'google' ? 'Use a mesma conta Google do e-mail informado.' : 'Use seu celular e a senha provisória ou pessoal enviada pelo RH.'; }; input.addEventListener('input', update); update(); let busy = false; const emailLogin = async () => { if (busy)
    return; busy = true; showError(''); const expected = input.value.trim().toLowerCase(); try {
    const signed = auth.isSignedIn() ? { user: await auth.getUser() } : await auth.signIn({ scope: 'openid email profile offline_access' });
    const selected = String(signed.user?.email || '').toLowerCase(), mismatch = expected ? accountMismatchMessage(expected, selected) : '';
    if (mismatch) {
        busy = false;
        return showError(mismatch);
    }
    await googleSession();
}
catch (x) {
    busy = false;
    showError(googleLoginError(x));
} }; goBtn.addEventListener('click', async () => { const i = input.value.trim(); if (loginMethod(i) === 'google')
    return void emailLogin(); if (busy)
    return; busy = true; showError(''); try {
    const r = await api.post('/api/edu/login', { identifier: i, password: (document.getElementById('pw') as HTMLInputElement).value });
    localStorage.setItem(S, r.data.token);
    me = { participant: r.data.participant };
    afterAuth();
}
catch (x) {
    busy = false;
    showError(message(x));
} }); document.getElementById('ad')?.addEventListener('click', emailLogin); }
async function go(x: string) { if (x === 'trilhas')
    return trilhas(); if (x === 'tarefas')
    return tarefas(); if (x === 'diagnostico')
    return diagnostico(); if (x === 'evolucao')
    return evolucao(); if (x === 'admin')
    return showRh(); home(); }
function learningUnits(): LearningUnit[] { return all().filter(u => CONTENT[u.id]).map(u => ({ id: u.id, title: String(u.n), competency: String(u.t), level: String(u.l) })); }
function currentAction(includePending = true) { return getNextLearningAction({ diagnosticCompleted: !!me?.participant.diagnosticCompletedAt, units: learningUnits(), progress: me?.participant.unitProgress, recommendedLevel: me?.participant.level || undefined, completedUnits: me?.participant.completedUnits, includePending }); }
function welcome() { ui('Boas-vindas', '<section class="edu-onboarding edu-card"><small>UNIVERSIDADE EMPRESARIAL</small><h1>Aprender para trabalhar com mais segurança e autonomia</h1><p>Aqui você encontra atividades curtas de comunicação e matemática ligadas à rotina de trabalho.</p><div class="edu-callout"><b>Primeiro, vamos conhecer seu ponto de partida</b><p>A sondagem não é prova e não dá nota. Ela leva cerca de 10 minutos, adapta as perguntas e pode ser pausada.</p></div><button id="welcomeStart" class="edu-primary">Começar sondagem</button></section>'); const button = document.getElementById('welcomeStart') as HTMLButtonElement | null; button?.addEventListener('click', diagnostico); void api.post('/api/edu/diagnostic/draft/read', { token: tok() }).then(r => { if (r.data.draft && button)
    button.textContent = 'Retomar sondagem'; }).catch(() => undefined); }
function journey() { const action = currentAction(false), levels = Object.entries(me?.participant.skillLevels || {}).slice(0, 4).map(([skill, level]) => '<li><span>' + String(T.find(t => t[0] === skill)?.[1] || skill) + '</span><b>' + level + '</b></li>').join(''); ui('Minha jornada', '<section class="edu-onboarding edu-card"><small>SEU PONTO DE PARTIDA</small><h1>Sua jornada está pronta</h1><p>As atividades foram organizadas por competência. Os níveis servem apenas para escolher um começo adequado e podem mudar conforme seu avanço.</p>' + (levels ? '<ul class="edu-level-summary">' + levels + '</ul>' : '') + '<div class="edu-callout"><b>Próxima atividade recomendada</b><p>' + (action.unit ? action.unit.title + ' · ' + action.unit.level : 'Explore as trilhas disponíveis') + ' · cerca de 10 minutos</p></div><button id="journeyStart" class="edu-primary">Iniciar primeira tarefa</button></section>'); document.getElementById('journeyStart')?.addEventListener('click', () => action.unit ? lesson(action.unit.id) : trilhas()); }
function home() {
    const pending = currentAction(true), action = pending.kind === 'pending_review' ? currentAction(false) : pending, target = action.unit;
    const metrics = progressMetrics(me?.participant.unitProgress || {});
    const signals = [
        metrics.completedThisWeek + ' atividades nesta semana',
        metrics.strengthened + ' competências fortalecidas',
        metrics.minutes + ' minutos de aprendizagem',
    ];
    const pendingHtml = pending.kind === 'pending_review' ? '<p class="edu-pending-note"><b>Aguardando correção:</b> você pode continuar outra atividade enquanto o RH avalia sua resposta.</p>' : '';
    ui('Universidade Empresarial',
        '<section class="edu-hero edu-continue"><small>CONTINUE DAQUI</small><h1>Olá, ' + me?.participant.name.split(' ')[0] + '</h1><div class="edu-next-action"><span>' + action.mode + '</span><h2>' + (target ? target.title + ' · ' + target.level : 'Trilhas disponíveis') + '</h2><p>' + action.label + ' · cerca de 10 minutos</p><button id="continueNow" class="edu-primary">' + action.label + '</button></div>' + pendingHtml + '</section>' +
        '<div class="edu-signal-grid">' + signals.map(signal => '<article class="edu-card"><b>' + signal + '</b></article>').join('') + '</div>' +
        (metrics.milestones.length ? '<p class="edu-milestone">Marco alcançado: uma competência completa.</p>' : '') +
        '<div class="edu-home-links"><button id="explore" class="edu-secondary">Explorar trilhas</button><button id="development" class="edu-secondary">Meu desenvolvimento</button></div>');
    document.getElementById('continueNow')?.addEventListener('click', () => target ? lesson(target.id) : action.kind === 'diagnostic' ? diagnostico() : trilhas());
    document.getElementById('explore')?.addEventListener('click', trilhas);
    document.getElementById('development')?.addEventListener('click', evolucao);
}
function trilhas() { const d = done(), levels = L.map((l, i) => '<div class="track-level ' + (me?.participant.level === l ? 'current' : '') + '"><b>' + l + '</b><small>' + ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Proficiente'][i] + '</small></div>').join(''); ui('Áreas de aprendizagem', '<section class="track-levels"><h2>Seu progresso por nível</h2><div class="track-level-row">' + levels + '</div></section><h2 class="track-heading">Escolha uma área</h2><div class="edu-areas">' + AREAS.map(a => { const total = a.skills.reduce((sum, k) => sum + L.filter(l => d.has(k + '-' + l)).length, 0), max = a.skills.length * 5, pct = max ? Math.round(total / max * 100) : 0; return '<button data-area="' + a.id + '" class="edu-area-card"><span class="edu-area-icon">' + a.icon + '</span><div><h2>' + a.name + '</h2><p>' + a.desc + '</p><b>' + (a.skills.length ? pct + '% concluído' : 'Em preparação') + '</b><div class="edu-progress"><i style="width:' + pct + '%"></i></div></div></button>'; }).join('') + '</div>', 'trilhas'); document.querySelectorAll<HTMLElement>('[data-area]').forEach(x => x.onclick = () => area(x.dataset.area || '')); }
function area(id: string) { const a = AREAS.find(x => x.id === id) || AREAS[0]; if (!a.skills.length) {
    ui(a.name, '<div class="edu-page-head"><button id="backAreas" class="edu-back">← Voltar às áreas</button><small>SEGUNDA FASE</small><h1>' + a.icon + ' ' + a.name + '</h1><p>' + a.desc + '</p></div><article class="edu-card edu-area-muted"><h2>Conteúdo em preparação</h2><p>Esta área será construída com competências de Segurança e EPI, Direitos e cidadania, Saúde e meio ambiente e Tecnologia básica.</p><p>Enquanto isso, Comunicação e Matemática já estão disponíveis para estudo e revisão.</p></article>', 'trilhas');
    document.getElementById('backAreas')?.addEventListener('click', trilhas);
    return;
} const d = done(); const cards = a.skills.map(k => { const t = T.find(x => x[0] === k); if (!t)
    return ''; const n = L.filter(l => d.has(k + '-' + l)).length, p = Math.round(n / 5 * 100); return '<article class="edu-card track-card"><i>' + t[2] + '</i><h3>' + t[1] + '</h3><b>' + p + '% concluído</b><div class="edu-progress"><i style="width:' + p + '%"></i></div><button data-track="' + k + '" class="' + (k === 'divisao' ? 'edu-primary' : 'edu-secondary') + '">Abrir competência</button></article>'; }).join(''); ui(a.name, '<div class="edu-page-head"><button id="backAreas" class="edu-back">← Voltar às áreas</button><small>ÁREA DE APRENDIZAGEM</small><h1>' + a.icon + ' ' + a.name + '</h1><p>' + a.desc + ' Escolha uma competência para ver os níveis N1–N5.</p></div><div class="edu-area-competencies">' + cards + '</div>', 'trilhas'); document.getElementById('backAreas')?.addEventListener('click', trilhas); document.querySelectorAll<HTMLElement>('[data-track]').forEach(x => x.onclick = () => trackPicker(x.dataset.track || '')); }
function trackPicker(id: string) { const t = T.find(x => x[0] === id) || T[0], parentArea = AREAS.find(a => a.skills.includes(String(t[0])))?.id || 'comunicacao', descs = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Proficiente']; const cards = L.map((l, i) => { const desc = (LEVEL_MATRIX[id] || [])[i] || ['Uma informação por vez, com exemplo', 'Conectar dados diretos', 'Aplicar na rotina', 'Comparar e justificar', 'Planejar e decidir'][i]; return '<article class="edu-card level-card"><span class="level-badge">' + l + '</span><h3>' + descs[i] + '</h3><p>' + desc + '</p><div class="level-actions"><button data-u="' + id + '-' + l + '" class="edu-secondary">Abrir unidade</button></div></article>'; }).join(''); ui(t[1] + ' · níveis', '<div class="edu-page-head"><button id="backArea" class="edu-back">← Voltar à área</button><small>Habilidades Fundamentais</small><h1>' + t[2] + ' ' + t[1] + '</h1><p>Escolha o nível da unidade. O diagnóstico recomenda por competência; Admin/RH pode revisar todos.</p></div><div class="level-grid">' + cards + '</div>', 'trilhas'); document.getElementById('backArea')?.addEventListener('click', () => area(parentArea)); document.querySelectorAll<HTMLElement>('[data-u]').forEach(x => x.onclick = () => lesson(x.dataset.u || '')); }
function lesson(id: string) {
    const unit = all().find(x => x.id === id);
    if (!unit) return trilhas();
    const base = CONTENT[id];
    if (!base) return trackPicker(unit.t);
    const content = { ...base, items: selectQuestions(id, base.items) };
    const access = lessonAccessViewModel(me?.participant.unitProgress?.[id]?.status);
    if (access.readOnly) {
        const feedback = access.feedback!;
        ui(unit.n + ' · ' + unit.l, '<article class="edu-card edu-result" tabindex="-1"><h1>' + feedback.title + '</h1><p>' + feedback.body + '</p><div class="level-actions"><button id="pendingNext" class="edu-primary">Próxima atividade</button><button id="pendingHome" class="edu-secondary">Voltar à jornada</button></div></article>', 'inicio');
        document.getElementById('pendingNext')?.addEventListener('click', tarefas);
        document.getElementById('pendingHome')?.addEventListener('click', home);
        return;
    }
    let step = 0, startedAt = Date.now(), attempts = 0, errors = 0;
    const openResponses: Array<{ question: string; response: string; itemIndex: number }> = [];
    const itemAttempts = Array(content.items.length).fill(0) as number[];
    const itemErrors = Array(content.items.length).fill(0) as number[];
    const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
    const status = me?.participant.unitProgress?.[id]?.status;
    const mode = status === 'review' ? 'Revisar' : status === 'practice' ? 'Praticar' : 'Aprender';
    const advance = async () => {
        if (step < content.items.length - 1) {
            step++;
            render();
            return;
        }
        try {
            const saved = await api.post('/api/edu/unit', {
                token: tok(), unit: id, attempts, correct: content.items.length, errors, hints: errors,
                durationSec: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
                questionStats: itemAttempts.map((count, index) => ({ attempts: count, errors: itemErrors[index] })),
                openResponses,
            });
            me = { participant: { ...me!.participant, completedUnits: saved.data.completedUnits || [], unitProgress: saved.data.unitProgress || {} } };
            const feedback = lessonFeedbackViewModel(saved.data.status === 'pending_review' ? 'pending_review' : saved.data.consolidated ? 'completed' : 'practice');
            ui(feedback.title, '<article class="edu-card edu-result" tabindex="-1"><h1>' + feedback.title + '</h1><p>' + feedback.body + '</p><div class="level-actions"><button id="resultNext" class="edu-primary">Próxima atividade</button><button id="resultHome" class="edu-secondary">Voltar à jornada</button></div></article>', 'inicio');
            document.querySelector<HTMLElement>('.edu-result')?.focus();
            document.getElementById('resultNext')?.addEventListener('click', home);
            document.getElementById('resultHome')?.addEventListener('click', home);
        } catch (error) {
            showInline({ title: 'Não foi possível salvar', body: message(error), hint: 'Sua resposta continua nesta tela.', action: 'Tentar novamente', tone: 'error' }, () => void advance());
        }
    };
    const showInline = (feedback: { title: string; body: string; hint: string; action: string; tone: string }, action: () => void) => {
        const region = document.getElementById('lessonFeedback');
        if (!region) return;
        region.className = 'edu-inline-feedback ' + feedback.tone;
        region.innerHTML = '<h3>' + esc(feedback.title) + '</h3><p>' + esc(feedback.body) + '</p>' + (feedback.hint ? '<p><b>Dica:</b> ' + esc(feedback.hint) + '</p>' : '') + '<button id="feedbackAction" class="edu-primary">' + esc(feedback.action) + '</button>';
        region.hidden = false;
        region.focus();
        document.getElementById('answerAction')?.setAttribute('disabled', 'true');
        document.getElementById('feedbackAction')?.addEventListener('click', action);
    };
    const render = () => {
        const item = content.items[step];
        const topic = String((item as { topic?: string }).topic || unit.n);
        const support = selectSupportExcerpt({ material: SUPPORT_MATERIALS.jovensAdultos || '', competency: unit.t, level: unit.l, topic });
        const controls = item.kind === 'text' || item.kind === 'short-text'
            ? '<label for="eduAnswer">Sua resposta<input id="eduAnswer" class="edu-text-input" autocomplete="off"></label>'
            : '<fieldset class="edu-options"><legend>Escolha uma alternativa</legend>' + (item.options || []).map(option => '<label class="edu-option"><input name="edu-answer" type="radio" value="' + esc(option) + '"><span>' + esc(option) + '</span></label>').join('') + '</fieldset>';
        const visual = item.visual?.src
            ? '<figure class="edu-question-visual"><img src="' + esc(item.visual.src) + '" alt="' + esc(item.visual.alt || '') + '" loading="lazy"></figure>'
            : '';
        ui(unit.n + ' · ' + unit.l,
            '<div class="edu-page-head compact"><button id="backLevel" class="edu-back">← Voltar</button><small>' + mode.toUpperCase() + ' · Atividade ' + (step + 1) + ' de ' + content.items.length + '</small><div class="edu-step-progress" aria-label="' + (step + 1) + ' de ' + content.items.length + '"><i style="width:' + ((step + 1) / content.items.length * 100) + '%"></i></div></div>' +
            '<article class="edu-card edu-lesson-card"><span class="edu-mode">' + mode + '</span><h1>' + esc(content.objective) + '</h1><div class="edu-example"><b>Exemplo e contexto</b><p>' + esc(String(content.material)).replace(/\\n/g, '<br>') + '</p></div>' + visual + '<h2>' + esc(item.prompt) + '</h2>' + controls +
            '<div id="lessonFeedback" class="edu-inline-feedback" role="status" aria-live="polite" tabindex="-1" hidden></div><button id="answerAction" class="edu-primary edu-answer-action">Verificar resposta</button>' +
            '<details class="edu-support-details"><summary>Ver material de apoio</summary><div class="edu-material"><b>Essencial</b><p>' + esc(support.essential).replace(/\n/g, '<br>') + '</p>' + (support.complementary ? '<details><summary>Conteúdo complementar</summary><p>' + esc(support.complementary).replace(/\n/g, '<br>') + '</p></details>' : '') + '</div></details></article>', 'trilhas');
        document.getElementById('backLevel')?.addEventListener('click', () => trackPicker(unit.t));
        document.getElementById('answerAction')?.addEventListener('click', () => {
            const radio = document.querySelector('input[name="edu-answer"]:checked') as HTMLInputElement | null;
            const typed = document.getElementById('eduAnswer') as HTMLInputElement | null;
            const value = (radio?.value || typed?.value || '').trim();
            const evaluation = evaluateLessonAnswer(item, value);
            if (!evaluation.valid) {
                showInline({ title: 'Complete sua resposta', body: item.kind === 'text' && item.minLength ? 'Escreva ao menos ' + item.minLength + ' caracteres.' : 'Selecione ou escreva uma resposta.', hint: '', action: 'Tentar novamente', tone: 'error' }, () => { render(); });
                return;
            }
            attempts++;
            itemAttempts[step]++;
            if (item.kind === 'text') openResponses[step] = { question: String(item.prompt || ''), response: value, itemIndex: step };
            if (evaluation.correct === false) {
                errors++;
                itemErrors[step]++;
            }
            const feedback = lessonAttemptFeedback({ correct: evaluation.correct, hint: item.hint, objective: content.objective });
            showInline(feedback, evaluation.correct === false ? () => render() : () => void advance());
        });
    };
    render();
}
function tarefas() { const x = all().filter(u => CONTENT[u.id]), d = done(), up = me?.participant.unitProgress || {}, now = Date.now(), skillLevels = me?.participant.skillLevels || {}, fallbackLevel = me?.participant.level || 'N1', nov = x.find(u => !d.has(u.id) && u.l === (skillLevels[u.t] || fallbackLevel)) || x.find(u => !d.has(u.id)) || x[0], due = x.find(u => { const p = up[u.id]; return p && (p.status === 'review' || (p.nextReviewAt && Date.parse(p.nextReviewAt) <= now)); }), rev = due || x.find(u => d.has(u.id)) || nov, label = (id: string) => { const p = up[id]; if (!p)
    return 'Não iniciado'; if (p.status === 'pending_review')
    return 'Aguardando correção'; if (p.status === 'review' || (p.nextReviewAt && Date.parse(p.nextReviewAt) <= now))
    return 'Revisar'; if (p.status === 'consolidated')
    return 'Consolidado'; return 'Em prática'; }, schedule = (id: string) => { const p = up[id]; if (!p?.nextReviewAt)
    return 'a programar'; const days = Math.max(0, Math.ceil((Date.parse(p.nextReviewAt) - now) / 86400000)); return days <= 0 ? 'disponível agora' : 'em ' + days + ' dia(s)'; }; ui('Tarefas diárias', '<div class="edu-page-head"><h1>Prática diária</h1><p>Uma tarefa nova fortalece a competência; uma revisão espaçada consolida o que já foi aprendido. O roteiro é adaptável, contextualizado e mantém comunicação de apoio quando houver dúvida.</p></div><div class="edu-grid two"><article class="edu-card"><small>NOVA · ' + label(nov.id) + '</small><h2>' + nov.n + ' · ' + nov.l + '</h2><p>' + nov.t + '</p><button data-u="' + nov.id + '" class="edu-primary">Fazer agora</button></article><article class="edu-card"><small>REVISÃO · ' + label(rev.id) + '</small><h2>' + rev.n + ' · ' + rev.l + '</h2><p>' + rev.t + '</p><p><b>Próxima revisão:</b> ' + schedule(rev.id) + '</p><button data-u="' + rev.id + '" class="edu-secondary">Revisar</button></article></div><article class="edu-card"><h2>Estados de aprendizagem</h2><p><b>Não iniciado</b> · <b>Em prática</b> · <b>Aguardando correção</b> · <b>Consolidado</b> · <b>Revisar</b></p><p>Intervalos progressivos: 1, 3, 7, 14 e 30 dias. Se houver erro em uma revisão, o intervalo volta uma etapa.</p></article>', 'tarefas'); document.querySelectorAll<HTMLElement>('[data-u]').forEach(x => x.onclick = () => lesson(x.dataset.u || '')); }
async function diagnostico() { const flow = await import('./diagnostic-flow'), skills = T.map(t => String(t[0])), names = Object.fromEntries(T.map(t => [String(t[0]), String(t[1])])); let state = flow.diagnosticInitialState(); const esc = (v: string) => v.replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x] || x)), norm = (v: string) => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(), save = async (next = state) => { const draft = flow.diagnosticDraftPayload(next); if (!draft)
    throw new Error('O estado da sondagem é inválido.'); await api.post('/api/edu/diagnostic/draft/save', { token: tok(), draft }); }, submit = async (next: typeof state) => { try {
    const result = await api.post('/api/edu/diagnostic', { token: tok(), context: { instrument: 'Sondagem adaptativa EJA autoral', references: 'Banco calibrado N1-N5 por competência' }, answers: next.assigned });
    say(result.data.result?.reviewSkills?.length ? 'Sondagem concluída. Algumas habilidades precisam de reforço.' : 'Sondagem concluída. Sua trilha foi ajustada por habilidade.');
    mount();
}
catch {
    say('Não foi possível concluir a sondagem. Sua resposta continua pronta para tentar novamente.');
} }; const render = () => { const skill = skills[state.skillIndex], id = skill + '-N' + state.level, item = CALIBRATION_BANK[id], unit = CONTENT[id], progress = flow.diagnosticProgress(state, skills.length), control = item.kind === 'text' ? '<textarea id="adaptiveAnswer" required placeholder="Escreva sua resposta"></textarea>' : (item.options || []).map(o => '<label class="edu-option"><input required type="radio" name="adaptiveAnswer" value="' + esc(o) + '">' + esc(o) + '</label>').join(''); ui('Sondagem inicial', '<form id="adaptiveDiag" class="edu-card edu-quiz"><h1>Sondagem adaptativa</h1><p>Competência ' + progress.competencyPosition + ' de ' + skills.length + ' · ' + progress.percentage + '% da sondagem · ' + esc(names[skill]) + '</p><div class="edu-example"><b>Habilidade:</b> ' + esc(unit.objective) + '<br><b>Referência:</b> ' + esc(item.source) + '<br><small>Banco autoral calibrado; nenhuma alternativa é copiada literalmente.</small></div><h2>' + esc(item.prompt) + '</h2>' + control + '<button class="edu-primary">Responder</button><button id="pauseDiagnostic" type="button" class="edu-secondary">Pausar e continuar depois</button><p><small>Seu avanço fica guardado com segurança. Você poderá retomar desta mesma etapa quando voltar.</small></p></form>', 'diagnostico'); document.getElementById('pauseDiagnostic')?.addEventListener('click', async () => { try {
    await save(state);
    home();
}
catch {
    say('Não foi possível guardar sua pausa. Tente novamente antes de sair.');
} }); document.getElementById('adaptiveDiag')?.addEventListener('submit', async (ev) => { ev.preventDefault(); const form = ev.currentTarget as HTMLFormElement, radio = form.querySelector('input[name="adaptiveAnswer"]:checked') as HTMLInputElement | null, typed = form.querySelector('#adaptiveAnswer') as HTMLTextAreaElement | null, value = (radio?.value || typed?.value || '').trim(), ok = item.kind === 'text' ? value.length >= 10 : norm(value) === norm(String(item.answer)); if (!value)
    return say('Responda para continuar.'); if (!ok)
    say(item.hint); if (ok && state.level < 5) {
    const next = { ...state, level: state.level + 1 };
    try {
        await save(next);
        state = next;
        render();
    }
    catch {
        say('Não foi possível salvar seu avanço. Tente responder novamente.');
    }
    return;
} const next = { skillIndex: state.skillIndex + 1, level: 1, assigned: { ...state.assigned, [skill]: ('level:N' + (ok ? state.level : nextDiagnosticLevel(state.level, false))) as typeof state.assigned[string] } }; if (state.skillIndex === skills.length - 1)
    return void submit(next); try {
    await save(next);
    state = next;
    render();
}
catch {
    say('Não foi possível salvar seu avanço. Tente responder novamente.');
} }); }; const load = async () => { ui('Sondagem inicial', '<article class="edu-card"><h1>Retomando sua sondagem…</h1><p>Estamos buscando o ponto em que você parou.</p></article>', 'diagnostico'); try {
    const response = await api.post('/api/edu/diagnostic/draft/read', { token: tok() });
    state = flow.applyLoadedDiagnosticDraft(flow.diagnosticInitialState(), response.data.draft);
    render();
}
catch {
    ui('Sondagem inicial', '<article class="edu-card"><h1>Não foi possível retomar sua sondagem</h1><p>Seu progresso não foi alterado. Verifique sua conexão e tente novamente.</p><button id="retryDiagnostic" class="edu-primary">Tentar novamente</button></article>', 'diagnostico');
    document.getElementById('retryDiagnostic')?.addEventListener('click', () => void load());
} }; await load(); }
function evolucao() {
    const progress = me?.participant.unitProgress || {}, action = currentAction(false);
    const rows = T.map(track => {
        const completed = L.filter(level => done().has(track[0] + '-' + level)).length;
        const state = progress[track[0] + '-N1'];
        const summary = competencySummary({ name: String(track[1]), completed, status: state?.status, hasActivity: !!state });
        const level = me?.participant.skillLevels?.[track[0]] || 'A definir';
        return '<article class="edu-progress-summary"><h3>' + summary.phrase + '</h3><p>' + summary.label + '</p><details><summary>Ver detalhes</summary><p>' + summary.details.completed + ' de ' + summary.details.total + ' unidades concluídas · nível interno ' + level + '</p></details></article>';
    }).join('');
    ui('Meu desenvolvimento',
        '<section class="edu-card edu-development-head"><small>SEU DESENVOLVIMENTO</small><h1>' + (done().size ? 'Você já concluiu ' + done().size + ' unidades.' : 'Sua jornada está começando.') + '</h1><p>Próxima ação: <b>' + action.label + '</b></p><button id="developmentNext" class="edu-primary">Continuar minha jornada</button></section>' +
        '<section class="edu-development-list">' + rows + '</section>' +
        '<article class="edu-card"><h2>O que significam os estados?</h2><p><b>Começando:</b> primeira atividade. <b>Aprendendo:</b> conteúdo em andamento. <b>Praticando:</b> revisão programada. <b>Dominado:</b> unidade concluída. <b>Aguardando correção:</b> resposta enviada ao RH.</p><button id="redoDiagnostic" class="edu-secondary">Fazer nova sondagem</button><p><small>Use esta opção para atualizar seu ponto de partida. As conclusões já registradas permanecem.</small></p></article>', 'evolucao');
    document.getElementById('developmentNext')?.addEventListener('click', () => action.unit ? lesson(action.unit.id) : action.kind === 'diagnostic' ? diagnostico() : trilhas());
    document.getElementById('redoDiagnostic')?.addEventListener('click', diagnostico);
}
function rhLoading() { ui('Administração RH', '<article class="edu-card"><h1>Carregando Administração RH…</h1><p>Aguarde enquanto carregamos as informações administrativas.</p></article>', 'admin'); }
function rhFailure(x: unknown) { const detail = adminFailureDetail(x); ui('Administração RH', '<article class="edu-card"><h1>Não foi possível abrir a Administração RH</h1><p>' + detail + '</p><button id="retryRh" class="edu-primary">Tentar novamente</button></article>', 'admin'); document.getElementById('retryRh')?.addEventListener('click', () => void showRh()); }
async function showRh() { rhLoading(); try {
    await rh();
}
catch (x) {
    rhFailure(x);
} }
async function rh() {
    if (!admin()) return home();
    const data = (await api.post('/api/edu/admin/overview', { token: tok() })).data;
    const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
    const actions = (data.actionParticipants || []).map((person: { id: string; name: string; email: string; group: string; evidence: string; nextAction: string; difficulty?: { competency: string; score: number } | null }) =>
        '<article class="edu-action-card ' + esc(person.group) + '"><small>' + esc(adminGroupLabel(person.group)) + '</small><h3>' + esc(person.name) + '</h3><p>' + esc(person.evidence) + '</p><b>Próxima ação: ' + esc(person.nextAction) + '</b></article>').join('');
    const pending = (data.pendingReviews || []).map((review: { id: string; participantName?: string; skill?: string; level?: string; question?: string; response?: string }) =>
        '<article class="review-item"><div><b>' + esc(review.participantName || 'Colaborador') + '</b><small>' + esc(review.skill || '') + ' · ' + esc(review.level || '') + '</small><p><b>Pergunta:</b> ' + esc(review.question || '') + '</p><p><b>Resposta:</b> ' + esc(review.response || '') + '</p></div><div class="review-actions"><button class="edu-primary" data-review-id="' + esc(review.id) + '" data-review-action="approve">Aprovar</button><button class="edu-secondary" data-review-id="' + esc(review.id) + '" data-review-action="needs_revision">Solicitar revisão</button></div></article>').join('');
    const people = (data.participants || []).map((person: { id: string; name: string; email?: string; role?: string; completedUnits?: string[]; diagnosticCompletedAt?: string }) => {
        const role = String(person.role || 'colaborador');
        const roleControl = canManageRoles() ? '<select aria-label="Perfil de ' + esc(person.name) + '" data-role-id="' + esc(person.id) + '" data-role-current="' + esc(role) + '">' + ['superadmin', 'admin', 'rh', 'gestor', 'colaborador'].map(value => '<option value="' + value + '" ' + (value === role ? 'selected' : '') + '>' + educationRoleLabel(value) + '</option>').join('') + '</select>' : educationRoleLabel(role);
        return '<tr><td>' + esc(person.name) + '</td><td>' + esc(person.email || '—') + '</td><td>' + roleControl + '</td><td>' + (person.completedUnits?.length || 0) + '</td><td>' + (person.diagnosticCompletedAt ? 'Concluída' : 'Pendente') + '</td></tr>';
    }).join('');
    ui('Administração RH',
        '<section class="edu-page-head"><small>PAINEL DE AÇÃO</small><h1>Quem precisa de atenção agora?</h1><p>Prioridades organizadas por evidência e próxima ação.</p></section>' +
        '<section class="edu-action-grid">' + (actions || '<article class="edu-card"><p>Nenhuma ação urgente.</p></article>') + '</section>' +
        '<details class="edu-admin-section" open><summary>Respostas para corrigir (' + (data.pendingReviews?.length || 0) + ')</summary><div class="review-queue">' + (pending || '<p>Nenhuma resposta pendente.</p>') + '</div></details>' +
        '<details class="edu-admin-section"><summary>Participantes e dados detalhados</summary><div class="table-scroll"><table class="curriculum-table"><thead><tr><th>Colaborador</th><th>E-mail</th><th>Perfil</th><th>Unidades</th><th>Sondagem</th></tr></thead><tbody>' + people + '</tbody></table></div></details>' +
        '<details class="edu-admin-section"><summary>Mapa curricular e biblioteca</summary><p>60 unidades · 12 competências · 3 áreas. Os conteúdos continuam disponíveis em Explorar trilhas.</p><button id="all" class="edu-secondary">Abrir trilhas</button></details>', 'admin');
    document.querySelectorAll<HTMLElement>('[data-review-id]').forEach(button => button.addEventListener('click', async () => {
        try {
            await api.post('/api/edu/admin/review', { token: tok(), reviewId: button.dataset.reviewId, action: button.dataset.reviewAction });
            await showRh();
        } catch (error) { say(message(error)); }
    }));
    document.getElementById('all')?.addEventListener('click', trilhas);
    document.querySelectorAll<HTMLSelectElement>('[data-role-id]').forEach(select => select.addEventListener('change', async () => {
        const before = select.dataset.roleCurrent || 'colaborador';
        try {
            const response = await api.post('/api/edu/admin/role', { token: tok(), participantId: select.dataset.roleId, role: select.value });
            select.dataset.roleCurrent = response.data.participant.role;
        } catch (error) {
            select.value = before;
            say(message(error));
        }
    }));
}
export function mountUniversity() { void mount(); }
