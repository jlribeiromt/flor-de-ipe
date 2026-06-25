// ==========================================
// CONFIGURAÇÃO DA API (GITHUB)
// ==========================================
const URL_CATALOGO = 'https://raw.githubusercontent.com/jlribeiromt/flor-de-ipe-catalogo/main/produtos.json';
const URL_IMAGEM_CATALOGO = 'https://raw.githubusercontent.com/jlribeiromt/flor-de-ipe-catalogo/main/imagens/';

let produtosJSON = [];
let configsLoja = {};
let sacola = JSON.parse(localStorage.getItem('flor_ipe_sacola_v2')) || [];

// ==========================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO
// ==========================================
async function carregarDados() {
    try {
        const resposta = await fetch(URL_CATALOGO);
        const dados = await resposta.json();

        configsLoja = dados.configuracoes;
        produtosJSON = dados.produtos;

        const gridDestaques = document.getElementById('grid-destaques');
        if (gridDestaques) {
            gridDestaques.innerHTML = dados.destaques.map(item => `
                <div class="col-md-4">
                    <div class="card-colecao">
                        <img src="${URL_IMAGEM_CATALOGO}${item.imagem}" loading="lazy" alt="${item.titulo}">
                        <div class="card-colecao-title">${item.titulo}</div>
                    </div>
                </div>
            `).join('');
        }

        renderizarProdutos();
        aplicarConfiguracoesDaLoja();
    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

// ==========================================
// FUNÇÕES DE EXIBIÇÃO E MODAL
// ==========================================
function renderizarProdutos() {
    const grid = document.getElementById('grid-produtos');
    if (!grid) return;
    
    grid.innerHTML = produtosJSON.map(prod => `
        <div class="masonry-item">
            <img src="${URL_IMAGEM_CATALOGO}${prod.imagem}" alt="${prod.nome}" loading="lazy" 
                 onclick="abrirModal(${prod.id}, '${prod.nome}', '${URL_IMAGEM_CATALOGO}${prod.imagem}', '${prod.descricao}')" 
                 style="cursor: pointer;">
            <div class="produto-info">
                <h5 class="titulo-premium">${prod.nome}</h5>
                <button class="btn btn-outline-premium w-100 py-2" onclick="adicionarASacola(${prod.id})">
                    Adicionar à Sacola
                </button>
            </div>
        </div>
    `).join('');
}

function abrirModal(id, nome, img, desc) {
    document.getElementById('modalNome').innerText = nome;
    document.getElementById('modalImagem').src = img;
    document.getElementById('modalDescricao').innerText = desc;
    
    const btnAdd = document.getElementById('btn-add-modal');
    btnAdd.onclick = function() {
        adicionarASacola(id);
        bootstrap.Modal.getInstance(document.getElementById('modalProduto')).hide();
    };
    
    new bootstrap.Modal(document.getElementById('modalProduto')).show();
}

// ==========================================
// SACOLA E CONFIGURAÇÕES
// ==========================================
function aplicarConfiguracoesDaLoja() {
    document.querySelectorAll('.link-whatsapp').forEach(btn => btn.href = `https://wa.me/${configsLoja.whatsapp}`);
    document.querySelectorAll('.link-instagram').forEach(btn => btn.href = configsLoja.instagram);
    document.querySelectorAll('.link-facebook').forEach(btn => btn.href = configsLoja.facebook);
    document.querySelectorAll('.link-tiktok').forEach(btn => btn.href = configsLoja.tiktok);
    document.querySelectorAll('.link-maps').forEach(btn => btn.href = configsLoja.maps);

    const listaHorarios = document.getElementById('lista-horarios');
    if (listaHorarios) {
        listaHorarios.innerHTML = configsLoja.horarios.map(h => `<li class="mb-2">${h}</li>`).join('') + `
            <li class="mb-2 mt-3"><i class="bi bi-geo-alt me-1"></i> ${configsLoja.endereco_curto}</li>
            <li class="mt-3 text-warning font-weight-bold" style="font-size: 0.85rem;"><i class="bi bi-box-seam me-1"></i> ${configsLoja.abrangencia}</li>`;
    }
}

function adicionarASacola(idProduto) {
    const produto = produtosJSON.find(p => p.id === idProduto);
    if (!produto || sacola.find(item => item.id === idProduto)) return;
    
    sacola.push(produto);
    localStorage.setItem('flor_ipe_sacola_v2', JSON.stringify(sacola));
    atualizarInterfaceSacola();
    bootstrap.Offcanvas.getOrCreateInstance('#sacolaOffcanvas').show();
}

function removerDaSacola(idProduto) {
    sacola = sacola.filter(item => item.id !== idProduto);
    localStorage.setItem('flor_ipe_sacola_v2', JSON.stringify(sacola));
    atualizarInterfaceSacola();
}

function atualizarInterfaceSacola() {
    document.getElementById('contador-sacola-desktop').innerText = sacola.length;
    document.getElementById('contador-sacola-mobile').innerText = sacola.length;
    const lista = document.getElementById('itens-sacola');
    lista.innerHTML = sacola.length === 0 ? '<p class="text-center">Sua sacola está vazia.</p>' : 
        sacola.map(item => `
            <div class="d-flex align-items-center mb-3">
                <img src="${URL_IMAGEM_CATALOGO}${item.imagem}" style="width:50px; height:60px; object-fit:cover;">
                <div class="ms-3">
                    <h6 class="mb-0">${item.nome}</h6>
                    <button class="btn btn-link btn-sm text-danger p-0" onclick="removerDaSacola(${item.id})">Remover</button>
                </div>
            </div>
        `).join('');
}

document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const msg = `Olá! Gostaria de verificar a disponibilidade destes looks:%0A` + sacola.map(i => `- ${i.nome}`).join('%0A');
    window.open(`https://wa.me/${configsLoja.whatsapp}?text=${msg}`, '_blank');
});

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceSacola();
});
