const TYPE_ICONS = {
    "火系": "🔥", "水系": "💧", "草系": "🌿", "电系": "⚡",
    "冰系": "❄️", "武系": "👊", "毒系": "☠️", "地系": "🌍",
    "翼系": "🕊️", "幻系": "🔮", "虫系": "🐛", "机械系": "⚙️",
    "幽系": "👻", "龙系": "🐉", "恶系": "🌑", "萌系": "🧚",
    "普通系": "⭐", "光系": "✨"
};

const TYPE_ICON_URLS = {
    "火系": "/type_icon/火系.jpg",
    "水系": "/type_icon/水系.jpg",
    "草系": "/type_icon/草系.jpg",
    "电系": "/type_icon/电系.jpg",
    "冰系": "/type_icon/冰系.jpg",
    "武系": "/type_icon/武系.jpg",
    "毒系": "/type_icon/毒系.jpg",
    "地系": "/type_icon/地系.jpg",
    "翼系": "/type_icon/翼系.jpg",
    "幻系": "/type_icon/幻系.jpg",
    "虫系": "/type_icon/虫系.jpg",
    "机械系": "/type_icon/机械系.jpg",
    "幽系": "/type_icon/幽系.jpg",
    "龙系": "/type_icon/龙系.jpg",
    "恶系": "/type_icon/恶系.jpg",
    "萌系": "/type_icon/萌系.jpg",
    "普通系": "/type_icon/普通系.jpg",
    "光系": "/type_icon/光系.jpg"
};

const TYPE_COLORS = {
    "火系": "#e53e3e", "水系": "#3182ce", "草系": "#38a169", "电系": "#d69e2e",
    "冰系": "#63b3ed", "武系": "#c05621", "毒系": "#805ad5", "地系": "#d69e2e",
    "翼系": "#90cdf4", "幻系": "#d53f8c", "虫系": "#38a169", "机械系": "#718096",
    "幽系": "#6b46c1", "龙系": "#6b46c1", "恶系": "#2d3748", "萌系": "#ed64a6",
    "普通系": "#a0aec0", "光系": "#ecc94b"
};

const TYPE_COLORS_LIGHT = {
    "火系": "#fc8181", "水系": "#63b3ed", "草系": "#68d391", "电系": "#f6e05e",
    "冰系": "#bee3f8", "武系": "#ed8936", "毒系": "#b794f4", "地系": "#f6e05e",
    "翼系": "#bee3f8", "幻系": "#f687b3", "虫系": "#68d391", "机械系": "#cbd5e0",
    "幽系": "#9f7aea", "龙系": "#9f7aea", "恶系": "#718096", "萌系": "#fbb6ce",
    "普通系": "#cbd5e0", "光系": "#faf089"
};

let allPetNames = [];
let currentQueryPet = null;
let currentTypeRelations = null;
let leftSimulation = null;
let rightSimulation = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initPage1();
    initPage2();
    initPage3();
    initPage4();
    loadPetNames();
});

function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.page).classList.add('active');
            if (btn.dataset.page === 'page1') {
                setTimeout(() => {
                    if (currentTypeRelations) renderLeftGraph(currentTypeRelations);
                }, 150);
            }
        });
    });

    restoreState();
}

function saveState() {
    const state = {
        activePage: document.querySelector('.nav-btn.active')?.dataset?.page,
        activeSearchTab: document.querySelector('.search-tab-btn.active')?.dataset?.tab,
        typeSearchInput: document.getElementById('type-search-input')?.value || '',
        nameSearchInput: document.getElementById('name-search-input')?.value || '',
        typeFilterSelections: Array.from(document.querySelectorAll('#type-checkboxes .type-checkbox.selected'))
            .map(el => el.dataset.type),
        nameResults: document.getElementById('name-results')?.innerHTML || '',
        typeResults: document.getElementById('type-results')?.innerHTML || '',
        eggSearchInput: document.getElementById('egg-search-input')?.value || '',
        eggResults: document.getElementById('egg-breedable-results')?.innerHTML || '',
        eggSearchInfo: document.getElementById('egg-search-info')?.innerHTML || '',
        eggSearchInfoVisible: document.getElementById('egg-search-info')?.classList.contains('show') || false
    };
    sessionStorage.setItem('returnState', JSON.stringify(state));
}

function navigateToDetail(url) {
    saveState();
    window.location.href = url;
}

function restoreState() {
    const saved = sessionStorage.getItem('returnState');
    if (!saved) return;
    sessionStorage.removeItem('returnState');
    try {
        const state = JSON.parse(saved);

        if (state.activePage) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            const navBtn = document.querySelector(`.nav-btn[data-page="${state.activePage}"]`);
            if (navBtn) navBtn.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const page = document.getElementById(state.activePage);
            if (page) page.classList.add('active');
        }

        if (state.activeSearchTab) {
            document.querySelectorAll('.search-tab-btn').forEach(b => b.classList.remove('active'));
            const tabBtn = document.querySelector(`.search-tab-btn[data-tab="${state.activeSearchTab}"]`);
            if (tabBtn) tabBtn.classList.add('active');
            document.querySelectorAll('.search-tab-content').forEach(c => c.classList.remove('active'));
            const tab = document.getElementById(state.activeSearchTab);
            if (tab) tab.classList.add('active');
        }

        if (state.typeSearchInput) document.getElementById('type-search-input').value = state.typeSearchInput;
        if (state.nameSearchInput) document.getElementById('name-search-input').value = state.nameSearchInput;
        if (state.eggSearchInput) document.getElementById('egg-search-input').value = state.eggSearchInput;

        if (state.nameResults) document.getElementById('name-results').innerHTML = state.nameResults;
        if (state.typeResults) document.getElementById('type-results').innerHTML = state.typeResults;
        if (state.eggResults) document.getElementById('egg-breedable-results').innerHTML = state.eggResults;
        if (state.eggSearchInfo) {
            document.getElementById('egg-search-info').innerHTML = state.eggSearchInfo;
            if (state.eggSearchInfoVisible) document.getElementById('egg-search-info').classList.add('show');
        }

        if (state.typeFilterSelections && state.typeFilterSelections.length > 0) {
            state.typeFilterSelections.forEach(t => {
                const el = document.querySelector(`#type-checkboxes .type-checkbox[data-type="${t}"]`);
                if (el) el.classList.add('selected');
            });
        }
    } catch(e) {}
}

async function loadPetNames() {
    try {
        const res = await fetch('/api/pet_names');
        allPetNames = await res.json();
    } catch (err) {
        console.error('加载精灵名称失败:', err);
    }
}

function initPage1() {
    const input = document.getElementById('type-search-input');
    const suggestions = document.getElementById('type-suggestions');
    const searchBtn = document.getElementById('type-search-btn');

    input.addEventListener('input', () => {
        const val = input.value.trim();
        if (!val) { suggestions.classList.remove('show'); return; }
        const matches = allPetNames.filter(n => n.includes(val)).slice(0, 8);
        if (matches.length === 0) { suggestions.classList.remove('show'); return; }
        suggestions.innerHTML = matches.map(n => `<div class="suggestion-item">${n}</div>`).join('');
        suggestions.classList.add('show');
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { suggestions.classList.remove('show'); queryTypeRelations(); }
    });

    suggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            input.value = e.target.textContent;
            suggestions.classList.remove('show');
            queryTypeRelations();
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestions.contains(e.target) && e.target !== input) {
            suggestions.classList.remove('show');
        }
    });

    searchBtn.addEventListener('click', queryTypeRelations);
    document.getElementById('clear-type-search').addEventListener('click', () => {
        input.value = '';
        suggestions.classList.remove('show');
        clearAllGraphs();
        const panel = document.getElementById('info-panel-content');
        if (panel) panel.innerHTML = '<p class="info-placeholder">输入精灵名称查询克制关系</p>';
        document.getElementById('right-panel-subtitle').textContent = '';
    });
    window.addEventListener('resize', () => {
        if (currentTypeRelations) renderLeftGraph(currentTypeRelations);
    });
}

async function queryTypeRelations() {
    const name = document.getElementById('type-search-input').value.trim();
    if (!name) return;
    try {
        const res = await fetch(`/api/type_relations?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.error) { alert(data.error); return; }
        currentQueryPet = data.pet;
        currentTypeRelations = data;
        renderLeftGraph(data);
        clearRightGraph();
        updateInfoPanel(data.pet, data.strong_against, data.weak_against);
    } catch (err) {
        console.error('查询克制关系失败:', err);
    }
}

function appendBaseDefs(defs) {
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const shadow = defs.append('filter').attr('id', 'drop-shadow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    shadow.append('feDropShadow').attr('dx', '0').attr('dy', '2').attr('stdDeviation', '3').attr('flood-opacity', '0.25');

    const pulseFilter = defs.append('filter').attr('id', 'pulse-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    pulseFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const pulseMerge = pulseFilter.append('feMerge');
    pulseMerge.append('feMergeNode').attr('in', 'blur');
    pulseMerge.append('feMergeNode').attr('in', 'blur');
    pulseMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

function appendGradients(defs) {
    Object.keys(TYPE_COLORS).forEach(typeName => {
        const grad = defs.append('radialGradient').attr('id', `grad-${typeName.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '')}`);
        grad.append('stop').attr('offset', '0%').attr('stop-color', TYPE_COLORS_LIGHT[typeName] || TYPE_COLORS[typeName]);
        grad.append('stop').attr('offset', '100%').attr('stop-color', TYPE_COLORS[typeName]);
    });
}

function getCurvePath(d) {
    const sx = d.source.x, sy = d.source.y;
    const tx = d.target.x, ty = d.target.y;
    const dx = tx - sx, dy = ty - sy;
    const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;
    return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
}

function renderLeftGraph(data) {
    if (leftSimulation) leftSimulation.stop();
    const panel = document.getElementById('left-graph-panel');
    const svg = d3.select('#left-graph-svg');
    svg.selectAll('*').remove();

    const width = panel.clientWidth;
    const height = panel.clientHeight - 80;
    svg.attr('width', width).attr('height', height);

    const pet = data.pet;
    const cx = width / 2, cy = height / 2;

    const allTypes = [...new Set([...data.strong_against, ...data.weak_against])];

    const nodes = [{
        id: pet.name, type: 'pet', x: cx, y: cy, fx: cx, fy: cy, data: pet
    }];

    const edges = [];

    const typeRadius = Math.min(width, height) * 0.35;
    allTypes.forEach((typeName, i) => {
        const angle = (2 * Math.PI * i) / allTypes.length - Math.PI / 2;
        nodes.push({
            id: typeName, type: 'type',
            x: cx + typeRadius * Math.cos(angle),
            y: cy + typeRadius * Math.sin(angle),
            data: typeName
        });

        if (data.strong_against.includes(typeName)) {
            edges.push({ source: pet.name, target: typeName, relation: 'strong', label: '' });
        }
        if (data.weak_against.includes(typeName)) {
            edges.push({ source: typeName, target: pet.name, relation: 'weak', label: '' });
        }
    });

    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.5, 3]).on('zoom', (event) => {
        g.attr('transform', event.transform);
    });
    svg.call(zoom);

    const defs = g.append('defs');
    appendBaseDefs(defs);
    appendGradients(defs);

    edges.forEach((e, i) => {
        const arrowColor = e.relation === 'strong' ? '#e53e3e' : '#3182ce';
        defs.append('marker')
            .attr('id', `larrow-${i}`).attr('viewBox', '0 -5 10 10')
            .attr('refX', 8).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto-start-reverse')
            .append('path').attr('d', 'M0,-3L6,0L0,3').attr('fill', 'none').attr('stroke', arrowColor).attr('stroke-width', 2);
    });

    const linkGroup = g.append('g').attr('class', 'links');
    const labelGroup = g.append('g').attr('class', 'edge-labels');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const link = linkGroup.selectAll('path').data(edges).enter().append('path')
        .attr('fill', 'none')
        .attr('stroke', d => d.relation === 'strong' ? '#fc8181' : '#63b3ed')
        .attr('stroke-width', 2.5)
        .attr('stroke-opacity', 0.7)
        .attr('marker-end', (_, i) => `url(#larrow-${i})`)
        .attr('class', 'graph-edge');

    const edgeLabel = labelGroup.selectAll('text').data(edges).enter().append('text')
        .attr('text-anchor', 'middle').attr('dy', '-6')
        .attr('fill', d => d.relation === 'strong' ? '#f87171' : '#60a5fa')
        .attr('font-size', '11px').attr('font-weight', '700')
        .attr('class', 'edge-label')
        .text(d => d.label);

    const node = nodeGroup.selectAll('g').data(nodes).enter().append('g')
        .attr('class', d => d.type === 'pet' ? 'graph-node-pet' : 'graph-node-type')
        .attr('filter', 'url(#drop-shadow)')
        .call(d3.drag()
            .on('start', (event, d) => { if (!event.active && d.type !== 'pet') leftSimulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => { if (!event.active && d.type !== 'pet') leftSimulation.alphaTarget(0); if (d.type !== 'pet') { d.fx = null; d.fy = null; } }));

    node.filter(d => d.type === 'type').each(function(d) {
        const g = d3.select(this);
        const gradId = `grad-${d.data.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '')}`;
        g.append('circle').attr('r', 26).attr('fill', '#122545')
            .attr('stroke', '#60a5fa').attr('stroke-width', 2.5)
            .attr('class', 'node-bg');
        const iconUrl = TYPE_ICON_URLS[d.data];
        if (iconUrl) {
            g.append('image').attr('x', -16).attr('y', -16).attr('width', 32).attr('height', 32)
                .attr('href', iconUrl).attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('class', 'node-icon');
        } else {
            g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
                .attr('fill', '#fff').attr('font-size', '14px').attr('font-weight', '600')
                .attr('class', 'node-icon').text(TYPE_ICONS[d.data] || d.data);
        }
        g.append('text').attr('text-anchor', 'middle').attr('dy', '2.8em')
            .attr('fill', '#cbd5e0').attr('font-size', '11px').attr('font-weight', '500')
            .attr('class', 'node-label').text(d.data);
    });

    node.filter(d => d.type === 'pet').each(function(d) {
        const pet = d.data;
        const g = d3.select(this);
        g.append('circle').attr('r', 42).attr('fill', '#1a3359')
            .attr('stroke', '#60a5fa').attr('stroke-width', 3.5)
            .attr('class', 'node-bg');
        g.append('image').attr('x', -32).attr('y', -32).attr('width', 64).attr('height', 64)
            .attr('href', pet.image_url || '').attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', 'circle(32px at 32px 32px)')
            .on('error', function() {
                d3.select(this).remove();
                g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
                    .attr('fill', '#4a90d9').attr('font-size', '20px').attr('font-weight', '700')
                    .text(pet.name.charAt(0));
            });
        g.append('text').attr('text-anchor', 'middle').attr('dy', '3.5em')
            .attr('fill', '#e2e8f0').attr('font-size', '13px').attr('font-weight', '700')
            .attr('class', 'node-label').text(pet.name);
        g.append('text').attr('text-anchor', 'middle').attr('dy', '4.8em')
            .attr('fill', '#94a3b8').attr('font-size', '10px')
            .text(pet.types ? pet.types.join('/') : '');
    });

    node.on('mouseenter', function(event, d) {
        showTooltip(event, d);
    });
    node.on('mouseleave', hideTooltip);

    node.on('click', function(event, d) {
        event.stopPropagation();
        highlightNode(d, nodes, edges, node, link, edgeLabel);
        if (d.type === 'type') {
            queryTypeRelationsBetween(currentQueryPet.name, d.data);
        }
        if (d.type === 'pet' && d.data && d.data.detail_url) {
            navigateToDetail(d.data.detail_url);
        }
    });

    svg.on('click', () => {
        resetHighlight(node, link, edgeLabel);
    });

    leftSimulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(130).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-350))
        .force('center', d3.forceCenter(cx, cy))
        .force('collision', d3.forceCollide().radius(45))
        .on('tick', () => {
            link.attr('d', getCurvePath);
            edgeLabel.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
}

function highlightNode(clickedNode, nodes, edges, nodeSelection, linkSelection, labelSelection) {
    const connectedIds = new Set([clickedNode.id]);
    edges.forEach(e => {
        const sid = typeof e.source === 'object' ? e.source.id : e.source;
        const tid = typeof e.target === 'object' ? e.target.id : e.target;
        if (sid === clickedNode.id) connectedIds.add(tid);
        if (tid === clickedNode.id) connectedIds.add(sid);
    });

    nodeSelection.each(function(d) {
        const el = d3.select(this);
        if (d.id === clickedNode.id) {
            el.select('.node-bg').transition().duration(300)
                .attr('stroke', '#f6e05e').attr('stroke-width', 5)
                .attr('filter', 'url(#pulse-glow)');
            el.style('opacity', 1);
            el.raise();
        } else if (connectedIds.has(d.id)) {
            el.style('opacity', 1);
            el.select('.node-bg').transition().duration(300)
                .attr('stroke', '#fff').attr('stroke-width', 2.5)
                .attr('filter', 'url(#drop-shadow)');
        } else {
            el.transition().duration(300).style('opacity', 0.12);
        }
    });

    linkSelection.each(function(d) {
        const sid = typeof d.source === 'object' ? d.source.id : d.source;
        const tid = typeof d.target === 'object' ? d.target.id : d.target;
        const isConnected = sid === clickedNode.id || tid === clickedNode.id;
        d3.select(this).transition().duration(300)
            .attr('stroke-opacity', isConnected ? 1 : 0.06)
            .attr('stroke-width', isConnected ? 3.5 : 1);
    });

    if (labelSelection) {
        labelSelection.each(function(d) {
            const sid = typeof d.source === 'object' ? d.source.id : d.source;
            const tid = typeof d.target === 'object' ? d.target.id : d.target;
            const isConnected = sid === clickedNode.id || tid === clickedNode.id;
            d3.select(this).transition().duration(300)
                .style('opacity', isConnected ? 1 : 0.06);
        });
    }
}

function resetHighlight(nodeSelection, linkSelection, labelSelection) {
    nodeSelection.transition().duration(300).style('opacity', 1)
        .each(function() {
            d3.select(this).select('.node-bg')
                .transition().duration(300)
                .attr('stroke', function() {
                    const d = d3.select(this.parentNode).datum();
                    return d && d.type === 'pet' ? '#60a5fa' : '#60a5fa';
                })
                .attr('stroke-width', function() {
                    const d = d3.select(this.parentNode).datum();
                    return d && d.type === 'pet' ? 3.5 : 2.5;
                })
                .attr('filter', 'url(#drop-shadow)');
        });
    linkSelection.transition().duration(300)
        .attr('stroke-opacity', 0.7).attr('stroke-width', 2.5);
    if (labelSelection) {
        labelSelection.transition().duration(300).style('opacity', 1);
    }
}

function showTooltip(event, d) {
    let tip = document.getElementById('graph-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'graph-tooltip';
        tip.className = 'graph-tooltip';
        document.body.appendChild(tip);
    }
    if (d.type === 'pet') {
        tip.innerHTML = `<strong>${d.data.name}</strong><br><small>${(d.data.types || []).join(' / ')}</small>`;
    } else if (d.type === 'type') {
        tip.innerHTML = `<strong>${d.data}</strong><br><small>点击查看详细关系</small>`;
    } else if (d.type === 'sameTypePet') {
        tip.innerHTML = `<strong>${d.data.name}</strong><br><small>${(d.data.types || []).join(' / ')}</small>`;
    }
    tip.style.display = 'block';
    tip.style.left = (event.clientX + 16) + 'px';
    tip.style.top = (event.clientY - 10) + 'px';
}

function hideTooltip() {
    const tip = document.getElementById('graph-tooltip');
    if (tip) tip.style.display = 'none';
}

function updateInfoPanel(pet, strongAgainst, weakAgainst) {
    const panel = document.getElementById('info-panel-content');
    if (!panel) return;
    panel.innerHTML = `
        <div class="info-pet-header">
            <span class="info-pet-name">${pet.name}</span>
            <span class="info-pet-id">${pet.id || ''}</span>
        </div>
        <div class="info-pet-types">
            ${(pet.types || []).map(t => `<span class="info-type-tag" style="background:${TYPE_COLORS[t] || '#a0aec0'}"><img src="${TYPE_ICON_URLS[t] || ''}" class="type-tag-icon" alt="${t}"> ${t}</span>`).join('')}
        </div>
        <div class="info-section">
            <div class="info-section-title">⚔️ 克制属性 (${strongAgainst.length})</div>
            <div class="info-type-list">
                ${strongAgainst.length > 0 ? strongAgainst.map(t => `<span class="info-type-chip strong-chip"><img src="${TYPE_ICON_URLS[t] || ''}" class="type-tag-icon" alt="${t}"> ${t}</span>`).join('') : '<span class="info-empty">无</span>'}
            </div>
        </div>
        <div class="info-section">
            <div class="info-section-title">🛡️ 被克制属性 (${weakAgainst.length})</div>
            <div class="info-type-list">
                ${weakAgainst.length > 0 ? weakAgainst.map(t => `<span class="info-type-chip weak-chip"><img src="${TYPE_ICON_URLS[t] || ''}" class="type-tag-icon" alt="${t}"> ${t}</span>`).join('') : '<span class="info-empty">无</span>'}
            </div>
        </div>
    `;
}

function updateInfoPanelForType(typeName, data) {
    const panel = document.getElementById('info-panel-content');
    if (!panel) return;
    const isStrong = data.strong_against.includes(typeName);
    const isWeak = data.weak_against.includes(typeName);
    let relationText;
    if (isStrong && isWeak) {
        relationText = `既克制 <strong>${data.pet.name}</strong>，也被 <strong>${data.pet.name}</strong> 克制`;
    } else if (isStrong) {
        relationText = `克制 <strong>${data.pet.name}</strong>`;
    } else if (isWeak) {
        relationText = `被 <strong>${data.pet.name}</strong> 克制`;
    } else {
        relationText = '无直接克制关系';
    }
    panel.innerHTML = `
        <div class="info-pet-header">
            <span class="info-pet-name"><img src="${TYPE_ICON_URLS[typeName] || ''}" class="type-info-icon" alt="${typeName}"> ${typeName}</span>
        </div>
        <div class="info-section">
            <div class="info-section-title">与 ${data.pet.name} 的关系</div>
            <p style="padding:8px 0;color:#94a3b8;font-size:0.9rem;">${relationText}（2x 伤害）</p>
        </div>
        <div class="info-section">
            <div class="info-section-title">💡 提示</div>
            <p style="padding:8px 0;color:#64748b;font-size:0.85rem;">点击右侧图谱查看该属性下的精灵</p>
        </div>
    `;
}

async function queryTypeRelationsBetween(petName, targetType) {
    try {
        const res = await fetch(`/api/type_relations_between?pet_name=${encodeURIComponent(petName)}&type=${encodeURIComponent(targetType)}`);
        const data = await res.json();
        if (data.error) { alert(data.error); return; }
        document.getElementById('right-panel-subtitle').textContent = `(${petName} ↔ ${targetType})`;
        renderRightGraph(data);
    } catch (err) {
        console.error('查询属性关系失败:', err);
    }
}

function renderRightGraph(data) {
    if (rightSimulation) rightSimulation.stop();
    const panel = document.getElementById('right-graph-panel');
    const svg = d3.select('#right-graph-svg');
    svg.selectAll('*').remove();

    const width = panel.clientWidth;
    const height = panel.clientHeight - 80;
    svg.attr('width', width).attr('height', height);

    const pet = data.pet;
    const targetType = data.target_type;
    const sameTypePets = data.same_type_pets;
    const relations = data.relations;
    const relationType = data.relation_type || 'same';
    const cx = width / 2, cy = height / 2;

    const nodes = [
        { id: pet.name, type: 'pet', x: cx, y: cy, fx: cx, fy: cy, data: pet },
        { id: targetType, type: 'type', x: cx, y: cy - Math.min(width, height) * 0.25, data: targetType }
    ];

    const edges = [];
    relations.forEach(rel => {
        if (rel.from === targetType) {
            edges.push({ source: targetType, target: pet.name, relation: rel.relation, label: '' });
        } else if (rel.to === targetType) {
            edges.push({ source: pet.name, target: targetType, relation: rel.relation, label: '' });
        }
    });

    const displayPets = sameTypePets.filter(p => p.name !== pet.name).slice(0, 15);
    displayPets.forEach((p, i) => {
        const angle = (2 * Math.PI * i) / displayPets.length;
        const r = Math.min(width, height) * 0.38;
        nodes.push({
            id: p.name, type: 'sameTypePet',
            x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle),
            data: p
        });
        if (relationType === 'strong') {
            edges.push({ source: pet.name, target: p.name, relation: 'strong', label: '' });
        } else if (relationType === 'weak') {
            edges.push({ source: p.name, target: pet.name, relation: 'weak', label: '' });
        } else if (relationType === 'both') {
            edges.push({ source: pet.name, target: p.name, relation: 'strong', label: '' });
            edges.push({ source: p.name, target: pet.name, relation: 'weak', label: '' });
        } else {
            edges.push({ source: pet.name, target: p.name, relation: 'sameType', label: '' });
        }
    });

    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.5, 3]).on('zoom', (event) => {
        g.attr('transform', event.transform);
    });
    svg.call(zoom);

    const defs = g.append('defs');
    appendBaseDefs(defs);
    appendGradients(defs);

    edges.forEach((e, i) => {
        const arrowColor = e.relation === 'strong' ? '#e53e3e' : (e.relation === 'weak' ? '#3182ce' : '#68d391');
        defs.append('marker')
            .attr('id', `rarrow-${i}`).attr('viewBox', '0 -5 10 10')
            .attr('refX', 8).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto-start-reverse')
            .append('path').attr('d', 'M0,-3L6,0L0,3').attr('fill', 'none').attr('stroke', arrowColor).attr('stroke-width', 2);
    });

    const linkGroup = g.append('g').attr('class', 'links');
    const labelGroup = g.append('g').attr('class', 'edge-labels');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const link = linkGroup.selectAll('path').data(edges).enter().append('path')
        .attr('fill', 'none')
        .attr('stroke', d => {
            if (d.relation === 'strong') return '#fc8181';
            if (d.relation === 'weak') return '#63b3ed';
            return '#68d391';
        })
        .attr('stroke-width', 2).attr('stroke-opacity', 0.7)
        .attr('marker-end', (_, i) => `url(#rarrow-${i})`)
        .attr('class', 'graph-edge');

    const edgeLabel = labelGroup.selectAll('text').data(edges).enter().append('text')
        .attr('text-anchor', 'middle').attr('dy', '-6')
        .attr('fill', d => {
            if (d.relation === 'strong') return '#f87171';
            if (d.relation === 'weak') return '#60a5fa';
            return '#4ade80';
        })
        .attr('font-size', '10px').attr('font-weight', '700')
        .attr('class', 'edge-label')
        .text(d => d.label);

    const node = nodeGroup.selectAll('g').data(nodes).enter().append('g')
        .attr('class', d => d.type === 'pet' ? 'graph-node-pet' : 'graph-node-type')
        .attr('filter', 'url(#drop-shadow)')
        .call(d3.drag()
            .on('start', (event, d) => { if (!event.active && d.type !== 'pet') rightSimulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => { if (!event.active && d.type !== 'pet') rightSimulation.alphaTarget(0); if (d.type !== 'pet') { d.fx = null; d.fy = null; } }));

    node.filter(d => d.type === 'type').each(function(d) {
        const g = d3.select(this);
        const gradId = `grad-${d.data.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '')}`;
        g.append('circle').attr('r', 28).attr('fill', '#122545')
            .attr('stroke', '#60a5fa').attr('stroke-width', 2.5).attr('class', 'node-bg');
        const iconUrl = TYPE_ICON_URLS[d.data];
        if (iconUrl) {
            g.append('image').attr('x', -18).attr('y', -18).attr('width', 36).attr('height', 36)
                .attr('href', iconUrl).attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('class', 'node-icon');
        } else {
            g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
                .attr('fill', '#fff').attr('font-size', '15px').attr('font-weight', '600')
                .attr('class', 'node-icon').text(TYPE_ICONS[d.data] || d.data);
        }
        g.append('text').attr('text-anchor', 'middle').attr('dy', '2.8em')
            .attr('fill', '#cbd5e0').attr('font-size', '11px').attr('font-weight', '500')
            .attr('class', 'node-label').text(d.data);
    });

    node.filter(d => d.type === 'pet').each(function(d) {
        const g = d3.select(this);
        g.append('circle').attr('r', 38).attr('fill', '#1a3359')
            .attr('stroke', '#60a5fa').attr('stroke-width', 3.5).attr('class', 'node-bg');
        g.append('image').attr('x', -28).attr('y', -28).attr('width', 56).attr('height', 56)
            .attr('href', pet.image_url || '').attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', 'circle(28px at 28px 28px)')
            .on('error', function() {
                d3.select(this).remove();
                g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
                    .attr('fill', '#4a90d9').attr('font-size', '18px').attr('font-weight', '700')
                    .text(pet.name.charAt(0));
            });
        g.append('text').attr('text-anchor', 'middle').attr('dy', '3.3em')
            .attr('fill', '#e2e8f0').attr('font-size', '12px').attr('font-weight', '700')
            .attr('class', 'node-label').text(pet.name);
    });

    node.filter(d => d.type === 'sameTypePet').each(function(d) {
        const g = d3.select(this);
        g.append('circle').attr('r', 20).attr('fill', '#122545')
            .attr('stroke', '#4ade80').attr('stroke-width', 2.5).attr('class', 'node-bg');
        g.append('image').attr('x', -14).attr('y', -14).attr('width', 28).attr('height', 28)
            .attr('href', d.data.image_url || '').attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('clip-path', 'circle(14px at 14px 14px)')
            .on('error', function() {
                d3.select(this).remove();
                g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
                    .attr('fill', '#38a169').attr('font-size', '11px').attr('font-weight', '700')
                    .text(d.data.name.charAt(0));
            });
        g.append('text').attr('text-anchor', 'middle').attr('dy', '2.6em')
            .attr('fill', '#94a3b8').attr('font-size', '9px').attr('font-weight', '600')
            .attr('class', 'node-label').text(d.data.name.length > 4 ? d.data.name.slice(0,4)+'..' : d.data.name);
    });

    node.on('mouseenter', function(event, d) {
        showTooltip(event, d);
    });
    node.on('mouseleave', hideTooltip);

    node.on('click', function(event, d) {
        event.stopPropagation();
        highlightNode(d, nodes, edges, node, link, edgeLabel);
        if (d.type === 'type') {
            queryTypeRelationsBetween(data.pet.name, d.data);
        }
        if ((d.type === 'pet' || d.type === 'sameTypePet') && d.data && d.data.detail_url) {
            navigateToDetail(d.data.detail_url);
        }
    });

    svg.on('click', () => resetHighlight(node, link, edgeLabel));

    rightSimulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(100).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-280))
        .force('center', d3.forceCenter(cx, cy))
        .force('collision', d3.forceCollide().radius(32))
        .on('tick', () => {
            link.attr('d', getCurvePath);
            edgeLabel.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
}

function clearRightGraph() {
    if (rightSimulation) rightSimulation.stop();
    const svg = d3.select('#right-graph-svg');
    svg.selectAll('*').remove();
    document.getElementById('right-panel-subtitle').textContent = '';
    const panel = document.getElementById('right-graph-panel');
    svg.attr('width', panel.clientWidth).attr('height', panel.clientHeight - 80);
    svg.append('text').attr('x', panel.clientWidth / 2).attr('y', (panel.clientHeight - 80) / 2)
        .attr('text-anchor', 'middle').attr('fill', '#a0aec0').attr('font-size', '14px')
        .text('点击左侧属性节点查看详细关系');
}

function clearAllGraphs() {
    if (leftSimulation) leftSimulation.stop();
    if (rightSimulation) rightSimulation.stop();
    d3.select('#left-graph-svg').selectAll('*').remove();
    d3.select('#right-graph-svg').selectAll('*').remove();
    currentQueryPet = null;
    currentTypeRelations = null;
    document.getElementById('right-panel-subtitle').textContent = '';
    const rp = document.getElementById('right-graph-panel');
    d3.select('#right-graph-svg').attr('width', rp.clientWidth).attr('height', rp.clientHeight - 80);
    d3.select('#right-graph-svg').append('text')
        .attr('x', rp.clientWidth / 2).attr('y', (rp.clientHeight - 80) / 2)
        .attr('text-anchor', 'middle').attr('fill', '#a0aec0').attr('font-size', '14px')
        .text('点击左侧属性节点查看详细关系');
}

function initPage2() {
    document.querySelectorAll('.search-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.search-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.search-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('name-search-btn').addEventListener('click', searchByName);
    document.getElementById('name-search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchByName();
    });
    document.getElementById('clear-name-search').addEventListener('click', () => {
        document.getElementById('name-search-input').value = '';
        document.getElementById('name-results').innerHTML = '';
    });

    loadTypes();
}

async function searchByName() {
    const keyword = document.getElementById('name-search-input').value.trim();
    if (!keyword) return;
    try {
        const res = await fetch(`/api/search/name?keyword=${encodeURIComponent(keyword)}`);
        const pets = await res.json();
        renderPetCards('name-results', pets);
    } catch (err) { console.error('名称检索失败:', err); }
}

async function loadTypes() {
    try {
        const res = await fetch('/api/types');
        const types = await res.json();
        const container = document.getElementById('type-checkboxes');
        container.innerHTML = types.map(type => `
            <label class="type-checkbox" data-type="${type}">
                <input type="checkbox" value="${type}">
                <span class="type-icon"><img src="${TYPE_ICON_URLS[type] || ''}" alt="${type}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;" onerror="this.parentElement.textContent='●'"></span>
                <span class="type-label">${type}</span>
            </label>
        `).join('');
        container.querySelectorAll('.type-checkbox').forEach(label => {
            label.addEventListener('click', () => {
                label.classList.toggle('selected');
                filterByTypes();
            });
        });
    } catch (err) { console.error('加载系别失败:', err); }
}

async function filterByTypes() {
    const selected = [];
    document.querySelectorAll('#type-checkboxes .type-checkbox.selected').forEach(label => {
        selected.push(label.dataset.type);
    });
    if (selected.length === 0) { document.getElementById('type-results').innerHTML = ''; return; }
    try {
        const params = new URLSearchParams();
        selected.forEach(t => params.append('types', t));
        const res = await fetch(`/api/search/type?${params.toString()}`);
        const pets = await res.json();
        if (!pets || pets.length === 0) {
            const typeNames = selected.join('和');
            document.getElementById('type-results').innerHTML = `<div class="empty-hint">没有精灵同时拥有${typeNames}属性</div>`;
            return;
        }
        renderPetCards('type-results', pets);
    } catch (err) { console.error('系别筛选失败:', err); }
}

function renderPetCards(containerId, pets) {
    const container = document.getElementById(containerId);
    if (!pets || pets.length === 0) {
        container.innerHTML = '<div class="empty-hint">未找到匹配的精灵</div>';
        return;
    }
    container.innerHTML = pets.map(p => `
        <div class="pet-card" onclick="navigateToDetail('${p.detail_url || '#'}')">
            <img class="pet-card-img" src="${p.image_url || ''}" alt="${p.name}" onerror="this.style.display='none'">
            <div class="pet-card-info">
                <div class="pet-card-name">${p.name}</div>
                <div class="pet-card-id">${p.id || ''} · ${p.evolution_stage || ''}</div>
                <div class="pet-card-types">
                    ${(p.types || []).map(t => `<span class="pet-type-tag" style="background:${TYPE_COLORS[t] || '#a0aec0'}"><img src="${TYPE_ICON_URLS[t] || ''}" class="type-tag-icon" alt="${t}">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function initPage3() {
    loadEggGroups();
    initEggSearch();
}

function initEggSearch() {
    const input = document.getElementById('egg-search-input');
    const suggestions = document.getElementById('egg-suggestions');
    const searchBtn = document.getElementById('egg-search-btn');

    input.addEventListener('input', async () => {
        const val = input.value.trim();
        if (!val) { suggestions.classList.remove('show'); return; }
        try {
            const res = await fetch(`/api/egg/search_pet?keyword=${encodeURIComponent(val)}`);
            const matches = await res.json();
            if (matches.length === 0) { suggestions.classList.remove('show'); return; }
            suggestions.innerHTML = matches.map(n => `<div class="suggestion-item">${n}</div>`).join('');
            suggestions.classList.add('show');
        } catch (err) { console.error('搜索蛋组精灵失败:', err); }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { suggestions.classList.remove('show'); queryBreedable(); }
    });

    suggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
            input.value = e.target.textContent;
            suggestions.classList.remove('show');
            queryBreedable();
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestions.contains(e.target) && e.target !== input) {
            suggestions.classList.remove('show');
        }
    });

    searchBtn.addEventListener('click', queryBreedable);

    document.getElementById('clear-egg-search').addEventListener('click', () => {
        document.getElementById('egg-search-input').value = '';
        document.getElementById('egg-suggestions').classList.remove('show');
        document.getElementById('egg-search-info').classList.remove('show');
        document.getElementById('egg-search-info').innerHTML = '';
        document.getElementById('egg-breedable-results').innerHTML = '<div class="empty-hint">请输入精灵名称查询可生蛋精灵</div>';
    });
}

async function queryBreedable() {
    const name = document.getElementById('egg-search-input').value.trim();
    if (!name) return;
    try {
        const res = await fetch(`/api/egg/breedable?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.error) {
            document.getElementById('egg-breedable-results').innerHTML = `<div class="empty-hint">${data.error}</div>`;
            document.getElementById('egg-search-info').classList.remove('show');
            return;
        }
        const infoDiv = document.getElementById('egg-search-info');
        const hasUnknown = data.egg_groups.some(g => g === '未知组' || g.includes('未知'));
        if (hasUnknown || data.breedable_count === 0) {
            infoDiv.innerHTML = `<strong>${data.pet_name}</strong> 属于蛋组：${data.egg_groups.map(g => `<span class="egg-group-tag">${g}</span>`).join(' ')}，该精灵<span style="color:#e53e3e;font-weight:700;">无法通过生蛋获得</span>`;
            infoDiv.classList.add('show');
            document.getElementById('egg-breedable-results').innerHTML = '<div class="empty-hint">该精灵无法生蛋，不可通过孵蛋获得</div>';
            return;
        }
        infoDiv.innerHTML = `<strong>${data.pet_name}</strong> 属于蛋组：${data.egg_groups.map(g => `<span class="egg-group-tag">${g}</span>`).join(' ')}，共可与 <strong>${data.breedable_count}</strong> 种精灵生蛋`;
        infoDiv.classList.add('show');
        renderPetCards('egg-breedable-results', data.breedable);
    } catch (err) { console.error('查询可生蛋精灵失败:', err); }
}

async function loadEggGroups() {
    try {
        const res = await fetch('/api/egg_groups');
        const groups = await res.json();
        const container = document.getElementById('egg-group-list');
        container.innerHTML = groups.map(g =>
            `<div class="egg-group-item" data-group="${g}">${g}</div>`
        ).join('');
        container.querySelectorAll('.egg-group-item').forEach(item => {
            item.addEventListener('click', () => {
                container.querySelectorAll('.egg-group-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                document.getElementById('egg-group-title').textContent = `蛋组: ${item.dataset.group}`;
                queryEggGroup(item.dataset.group);
            });
        });
    } catch (err) { console.error('加载蛋组失败:', err); }
}

async function queryEggGroup(group) {
    try {
        const res = await fetch(`/api/pets/by_egg_group?group=${encodeURIComponent(group)}`);
        const pets = await res.json();
        renderPetCards('egg-group-results', pets);
    } catch (err) { console.error('蛋组查询失败:', err); }
}

function initPage4() {}

async function openPetDetail(petName) {
    try {
        const res = await fetch(`/api/pet/${encodeURIComponent(petName)}`);
        const pet = await res.json();
        if (pet.error) { alert(pet.error); return; }

        const modal = document.getElementById('pet-detail-modal');
        const content = document.getElementById('pet-detail-content');

        const stats = pet.stats || {};
        const statLabels = { hp: 'HP', attack: '攻击', defense: '防御', sp_attack: '特攻', sp_defense: '特防', speed: '速度' };

        content.innerHTML = `
            <div class="pet-detail-header">
                <img class="pet-detail-img" src="${pet.image_url || ''}" alt="${pet.name}" onerror="this.style.display='none'">
                <div class="pet-detail-info">
                    <div class="pet-detail-name">${pet.name}</div>
                    <div class="pet-detail-meta">${pet.id || ''} · ${pet.evolution_stage || ''} · ${pet.form || ''}</div>
                    <div class="pet-detail-types">
                        ${(pet.types || []).map(t => `<span class="pet-detail-type-tag" style="background:${TYPE_COLORS[t] || '#a0aec0'}"><img src="${TYPE_ICON_URLS[t] || ''}" class="type-tag-icon" alt="${t}">${t}</span>`).join('')}
                    </div>
                    ${pet.egg_group ? `<div class="pet-detail-meta">蛋组: ${pet.egg_group}</div>` : ''}
                </div>
            </div>
            ${pet.description ? `<div class="pet-detail-section"><div class="pet-detail-section-title">简介</div><p style="color:#94a3b8;font-size:0.9rem;">${pet.description}</p></div>` : ''}
            ${pet.traits ? `<div class="pet-detail-section"><div class="pet-detail-section-title">特性</div><div class="pet-detail-skills">${pet.traits.map(t => `<span class="pet-detail-skill">${t}</span>`).join('')}</div></div>` : ''}
            <div class="pet-detail-section">
                <div class="pet-detail-section-title">种族值</div>
                <div class="pet-detail-stats">
                    ${Object.keys(statLabels).map(k => `
                        <div class="pet-detail-stat">
                            <div class="pet-detail-stat-val">${stats[k] || '-'}</div>
                            <div class="pet-detail-stat-label">${statLabels[k]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${pet.skills && pet.skills.length > 0 ? `
            <div class="pet-detail-section">
                <div class="pet-detail-section-title">技能 (${pet.skills.length})</div>
                <div class="pet-detail-skills">
                    ${pet.skills.map(s => `<span class="pet-detail-skill">${s.name} <span class="skill-power">${s.power}</span></span>`).join('')}
                </div>
            </div>` : ''}
            ${pet.detail_url ? `<a class="pet-detail-link" href="${pet.detail_url}" target="_blank">查看完整百科页面 →</a>` : ''}
        `;

        modal.classList.add('show');
    } catch (err) { console.error('获取精灵详情失败:', err); }
}

function closePetDetail() {
    document.getElementById('pet-detail-modal').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('pet-detail-modal');
    if (modal) {
        modal.querySelector('.pet-detail-overlay').addEventListener('click', closePetDetail);
        document.getElementById('pet-detail-close').addEventListener('click', closePetDetail);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closePetDetail();
            }
        });
    }
});