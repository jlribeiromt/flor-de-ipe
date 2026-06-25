// ==========================================
// CONFIGURAÇÃO DA API (GITHUB)
// ==========================================
const URL_CATALOGO = 'https://raw.githubusercontent.com/jlribeiromt/flor-de-ipe-catalogo/main/produtos.json';

let produtosJSON = [];
let configsLoja = {};
let sacola = JSON.parse(localStorage.getItem('flor_ipe_sacola_v2')) || [];

// ==========================================
// FUNÇÕES DE INICIALIZAÇÃO
// ==========================================
async function carregarDados() {
    try {
        const resposta = await fetch('produtos.json');
        const dados = await resposta.json();

        // 1. Renderizar Destaques (Coleções)
        const gridDestaques = document.getElementById('grid-destaques');
        gridDestaques.innerHTML = dados.destaques.map(item => `
            <div class="col-md-4">
                <div class="card-colecao">
                    <img src="imagens/${item.imagem}" loading="lazy">
                    <div class="card-colecao-title">${item.titulo}</div>
                </div>
            </div>
        `).join('');

        // 2. Renderizar Vitrine (Novidades)
        const gridProdutos = document.getElementById('grid-produtos');
        gridProdutos.innerHTML = dados.produtos.map(p => `
            <div class="masonry-item" onclick="abrirModal('${p.nome}', 'imagens/${p.imagem}', '${p.descricao}')" style="cursor:pointer">
                <img src="imagens/${p.imagem}" loading="lazy">
                <div class="produto-info">
                    <h5>${p.nome}</h5>
                    <p>${p.categoria}</p>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error("Erro ao carregar:", e); }
}

function abrirModal(nome, img, desc) {
    document.getElementById('modalNome').innerText = nome;
    document.getElementById('modalImagem').src = img;
    document.getElementById('modalDescricao').innerText = desc;
    new bootstrap.Modal(document.getElementById('modalProduto')).show();
}

document.addEventListener('DOMContentLoaded', carregarDados);

// Injeta os dados do JSON em todos os lugares do HTML
function aplicarConfiguracoesDaLoja() {
    // 1. Atualizar todos os links de WhatsApp
    document.querySelectorAll('.link-whatsapp').forEach(btn => {
        btn.href = `https://wa.me/${configsLoja.whatsapp}`;
    });

    // 2. Atualizar Redes Sociais e Mapa
    document.querySelectorAll('.link-instagram').forEach(btn => btn.href = configsLoja.instagram);
    document.querySelectorAll('.link-facebook').forEach(btn => btn.href = configsLoja.facebook);
    document.querySelectorAll('.link-tiktok').forEach(btn => btn.href = configsLoja.tiktok);
    document.querySelectorAll('.link-maps').forEach(btn => btn.href = configsLoja.maps);

    // 3. Injetar Horários de Atendimento no Rodapé
    const listaHorarios = document.getElementById('lista-horarios');
    if (listaHorarios) {
        listaHorarios.innerHTML = '';
        configsLoja.horarios.forEach(horario => {
            listaHorarios.innerHTML += `<li class="mb-2">${horario}</li>`;
        });
        
        // Adiciona o endereço logo abaixo dos horários
        listaHorarios.innerHTML += `
            <li class="mb-2 mt-3">
                <i class="bi bi-geo-alt text-white me-1"></i> 
                <a href="${configsLoja.maps}" target="_blank" class="text-white text-decoration-none opacity-75">${configsLoja.endereco_curto}</a>
            </li>
            <li class="mt-3 text-warning font-weight-bold" style="font-size: 0.85rem;">
                <i class="bi bi-box-seam me-1"></i> ${configsLoja.abrangencia}
            </li>
        `;
    }
}

// ==========================================
// FUNÇÕES DE CATÁLOGO
// ==========================================
function renderizarProdutos() {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = '';

    produtosJSON.forEach(prod => {
        const itemHTML = `
            <div class="masonry-item">
                <img src="${prod.imagem}" alt="${prod.nome}" loading="lazy">
                <div class="produto-info">
                    <span class="text-uppercase small mb-1 d-block" style="font-size:0.7rem; letter-spacing:1px; color: var(--cor-rose-accent); font-weight:500;">${prod.categoria}</span>
                    <h5 class="titulo-premium" style="font-size:1.15rem; font-weight:500;">${prod.nome}</h5>
                    <p class="text-muted mb-3">Grades: ${prod.tamanhos}</p>
                    <button class="btn btn-outline-premium w-100 py-2" style="font-size:0.75rem; letter-spacing:1px;" onclick="adicionarASacola(${prod.id})">
                        Adicionar à Sacola
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += itemHTML;
    });
}

// ==========================================
// FUNÇÕES DA SACOLA DE INTERESSE
// ==========================================
function adicionarASacola(idProduto) {
    const produto = produtosJSON.find(p => p.id === idProduto);
    if (!produto) return;

    const existe = sacola.find(item => item.id === idProduto);
    if (!existe) {
        sacola.push(produto);
        localStorage.setItem('flor_ipe_sacola_v2', JSON.stringify(sacola));
        atualizarInterfaceSacola();
        
        const sacolaElement = document.getElementById('sacolaOffcanvas');
        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(sacolaElement);
        bsOffcanvas.show();
    }
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
    lista.innerHTML = '';

    if (sacola.length === 0) {
        lista.innerHTML = '<div class="text-center text-muted py-5 font-weight-light"><i class="bi bi-handbag fs-1 d-block mb-2 opacity-50"></i>Sua sacola está vazia.</div>';
        return;
    }

    sacola.forEach(item => {
        lista.innerHTML += `
            <div class="d-flex align-items-center mb-3 pb-3" style="border-bottom: 1px solid rgba(0,0,0,0.04);">
                <img src="${item.imagem}" alt="${item.nome}" style="width: 65px; height: 85px; object-fit: cover;">
                <div class="ms-3 flex-grow-1">
                    <h6 class="mb-1 titulo-premium" style="font-size: 0.95rem; font-weight:500;">${item.nome}</h6>
                    <small class="text-muted d-block" style="font-size:0.75rem;">Disponível nos tamanhos: ${item.tamanhos}</small>
                    <button class="btn btn-link text-danger p-0 text-decoration-none mt-1 small" style="font-size: 0.75rem; font-weight:500;" onclick="removerDaSacola(${item.id})">Remover Look</button>
                </div>
            </div>
        `;
    });
}

// ==========================================
// INTEGRAÇÃO WHATSAPP (SACOLA)
// ==========================================
document.getElementById('btn-whatsapp').addEventListener('click', function() {
    if (sacola.length === 0) {
        alert("Sua sacola está vazia.");
        return;
    }

    // Agora ele pega o número direto do GitHub!
    const numeroWhatsApp = configsLoja.whatsapp; 
    let mensagem = "Olá, Equipe Flor de Ipê! ✨%0A%0AEstive no site e me apaixonei por esses looks da curadoria premium. Gostaria de verificar a disponibilidade para atendimento:%0A%0A";

    sacola.forEach((item, index) => {
        mensagem += `*${index + 1}. ${item.nome}*%0A`;
        mensagem += `   Ref. Tamanhos: ${item.tamanhos}%0A%0A`;
    });

    mensagem += "Gostaria de agendar meu atendimento personalizado. Aguardo o retorno!";

    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); 
    atualizarInterfaceSacola();
});