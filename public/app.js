// Funções compartilhadas pelas páginas do site
const API = '/api';

const Sessao = {
  get token() { return localStorage.getItem('token'); },
  get usuario() {
    try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; }
  },
  salvar(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },
  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('animalSelecionado');
    window.location.href = '/index.html';
  }
};

async function api(caminho, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Sessao.token) headers.Authorization = `Bearer ${Sessao.token}`;
  const resp = await fetch(API + caminho, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const dados = await resp.json().catch(() => ({}));
  if (resp.status === 401 && Sessao.token) {
    // token expirado: volta ao login
    Sessao.sair();
  }
  if (!resp.ok) {
    const erro = new Error(dados.erro || `Erro ${resp.status}`);
    erro.status = resp.status;
    erro.dados = dados;
    throw erro;
  }
  return dados;
}

// Regra de negócio 1: páginas de seleção/pedido exigem login
function exigirLogin() {
  if (!Sessao.token) {
    window.location.href = '/index.html?msg=login';
    return false;
  }
  return true;
}

function mostrarMensagem(el, texto, tipo = 'erro') {
  el.textContent = texto;
  el.className = `mensagem ${tipo}`;
  el.hidden = !texto;
}

function montarCabecalho() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const u = Sessao.usuario;
  if (u) {
    nav.innerHTML = `<span>Olá, <strong></strong> (${u.tipo === 'ong' ? 'ONG' : 'adotante'})</span>
      <a href="/animais.html">Animais</a> <a href="/pedido.html">Meus pedidos</a>
      <button type="button" class="link" id="sair">Sair</button>`;
    nav.querySelector('strong').textContent = u.nome;
    document.getElementById('sair').addEventListener('click', () => Sessao.sair());
  } else {
    nav.innerHTML = '<a href="/index.html">Entrar</a> <a href="/cadastro.html">Cadastrar</a>';
  }
}

const rotuloPorte = { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' };
const rotuloStatus = { pendente: 'Pendente', aprovado: 'Aprovado', recusado: 'Recusado' };
const anos = (n) => (n === 1 ? '1 ano' : `${n} anos`);

// Imagem do animal: foto cadastrada ou ilustração padrão da espécie
function fotoAnimal(a) {
  return a.fotoUrl || `/img/${['cachorro', 'gato'].includes(a.especie) ? a.especie : 'outro'}.svg`;
}
function imagemPadrao(img, especie) {
  img.onerror = null;
  img.src = `/img/${['cachorro', 'gato'].includes(especie) ? especie : 'outro'}.svg`;
}

function escapar(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', montarCabecalho);
