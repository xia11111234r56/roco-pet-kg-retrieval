import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '_libs'))
from flask import Flask, render_template, jsonify, request, send_from_directory
import json
from openpyxl import load_workbook

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

TYPE_COLORS = {
    "火系": "#e53e3e", "水系": "#3182ce", "草系": "#38a169", "电系": "#d69e2e",
    "冰系": "#63b3ed", "武系": "#c05621", "毒系": "#805ad5", "地系": "#d69e2e",
    "翼系": "#90cdf4", "幻系": "#d53f8c", "虫系": "#38a169", "机械系": "#718096",
    "幽系": "#6b46c1", "龙系": "#6b46c1", "恶系": "#2d3748", "萌系": "#ed64a6",
    "普通系": "#a0aec0", "光系": "#ecc94b",
}

TYPE_ICON_URLS = {
    "火系": "/type_icon/火系.jpg", "水系": "/type_icon/水系.jpg",
    "草系": "/type_icon/草系.jpg", "电系": "/type_icon/电系.jpg",
    "冰系": "/type_icon/冰系.jpg", "武系": "/type_icon/武系.jpg",
    "毒系": "/type_icon/毒系.jpg", "地系": "/type_icon/地系.jpg",
    "翼系": "/type_icon/翼系.jpg", "幻系": "/type_icon/幻系.jpg",
    "虫系": "/type_icon/虫系.jpg", "机械系": "/type_icon/机械系.jpg",
    "幽系": "/type_icon/幽系.jpg", "龙系": "/type_icon/龙系.jpg",
    "恶系": "/type_icon/恶系.jpg", "萌系": "/type_icon/萌系.jpg",
    "普通系": "/type_icon/普通系.jpg", "光系": "/type_icon/光系.jpg",
}

TYPE_SHORT_TO_FULL = {
    "火": "火系", "水": "水系", "草": "草系", "冰": "冰系",
    "龙": "龙系", "电": "电系", "毒": "毒系", "虫": "虫系",
    "武": "武系", "翼": "翼系", "萌": "萌系", "光": "光系",
    "幽": "幽系", "恶": "恶系", "机械": "机械系", "地": "地系",
    "普通": "普通系", "幻": "幻系"
}

def load_pets():
    pets_file = os.path.join(DATA_DIR, '洛克王国精灵数据.json')
    if os.path.exists(pets_file):
        with open(pets_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        pets = []
        for item in raw_data:
            raw_types = item.get('属性', '')
            types_short = [t.strip() for t in raw_types.split('/')]
            types_full = [TYPE_SHORT_TO_FULL.get(t, t + '系') for t in types_short]
            pets.append({
                'id': item.get('编号', ''),
                'name': item.get('名称', ''),
                'types': types_full,
                'types_short': types_short,
                'evolution_stage': item.get('进化阶段', ''),
                'form': item.get('形态', ''),
                'image_url': item.get('图片', ''),
                'detail_url': f'/pet/{item.get("名称", "")}'
            })
        return pets
    return []

def load_type_chart():
    chart_file = os.path.join(DATA_DIR, 'type_chart.json')
    if os.path.exists(chart_file):
        with open(chart_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def load_egg_data():
    egg_file = os.path.join(DATA_DIR, 'egg_standardized.xlsx')
    if not os.path.exists(egg_file):
        return {}, {}
    wb = load_workbook(egg_file, read_only=True)
    ws = wb.active
    pet_egg_groups = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        _, name, group_str = row
        if not name:
            continue
        name = str(name).strip()
        group_str = str(group_str).strip() if group_str else ''
        groups = [g.strip() for g in group_str.replace('，', ',').split(',') if g.strip()]
        if name not in pet_egg_groups:
            pet_egg_groups[name] = []
        for g in groups:
            if g not in pet_egg_groups[name]:
                pet_egg_groups[name].append(g)
    wb.close()
    group_pets = {}
    for pet_name, groups in pet_egg_groups.items():
        for g in groups:
            if g not in group_pets:
                group_pets[g] = []
            if pet_name not in group_pets[g]:
                group_pets[g].append(pet_name)
    return pet_egg_groups, group_pets

def load_pet_details():
    import csv
    detail_file = os.path.join(DATA_DIR, 'detail.csv')
    details = {}
    if os.path.exists(detail_file):
        with open(detail_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get('name', '').strip()
                if not name:
                    continue
                details[name] = {
                    'hp': row.get('hp', ''),
                    'attack': row.get('attack', ''),
                    'magic_attack': row.get('magic_attack', ''),
                    'defense': row.get('defense', ''),
                    'magic_defense': row.get('magic_defense', ''),
                    'speed': row.get('speed', ''),
                    'ability_name': row.get('ability_name', ''),
                    'ability_desc': row.get('ability_desc', ''),
                    'restrain': [t.strip() for t in row.get('restrain', '').split('/') if t.strip()],
                    'restrained_by': [t.strip() for t in row.get('restrained_by', '').split('/') if t.strip()],
                    'resistance': [t.strip() for t in row.get('resistance', '').split('/') if t.strip()],
                    'resisted_by': [t.strip() for t in row.get('resisted_by', '').split('/') if t.strip()],
                    'can_evolve': row.get('can_evolve', ''),
                    'evolve_level_1': row.get('evolve_level_1', ''),
                    'evolve_level_2': row.get('evolve_level_2', ''),
                    'blood_skill_count': row.get('blood_skill_count', ''),
                    'skill_stone_count': row.get('skill_stone_count', ''),
                    'learnable_skill_count': row.get('learnable_skill_count', ''),
                    'blood_skill_list': [s.strip() for s in row.get('blood_skill_list', '').split('、') if s.strip()],
                    'skill_stone_list': [s.strip() for s in row.get('skill_stone_list', '').split('、') if s.strip()],
                    'skill_list': [s.strip() for s in row.get('skill_list', '').split('、') if s.strip()],
                    'base_form': row.get('base_form', ''),
                    'evolve_form_1': row.get('evolve_form_1', ''),
                    'evolve_form_2': row.get('evolve_form_2', ''),
                }
    return details

@app.route('/type_icon/<path:filename>')
def serve_type_icon(filename):
    return send_from_directory(DATA_DIR, filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pet/<pet_name>')
def pet_detail_page(pet_name):
    pets = load_pets()
    pet = None
    for p in pets:
        if p['name'] == pet_name:
            pet = p
            break
    if not pet:
        return "精灵未找到", 404
    details = load_pet_details()
    detail = details.get(pet_name, {})
    return render_template('pet_detail.html', pet=pet, detail=detail, TYPE_COLORS=TYPE_COLORS, TYPE_ICON_URLS=TYPE_ICON_URLS)

@app.route('/bg.jpg')
def serve_bg():
    return send_from_directory(DATA_DIR, '背景图.jpg')

@app.route('/api/pets')
def get_pets():
    pets = load_pets()
    return jsonify(pets)

@app.route('/api/pet/<pet_name>')
def get_pet_detail(pet_name):
    pets = load_pets()
    for p in pets:
        if p['name'] == pet_name:
            return jsonify(p)
    return jsonify({'error': '未找到该精灵'}), 404

@app.route('/api/search/name')
def search_by_name():
    keyword = request.args.get('keyword', '').strip()
    pets = load_pets()
    if not keyword:
        return jsonify([])
    results = [p for p in pets if keyword.lower() in p.get('name', '').lower()]
    return jsonify(results)

@app.route('/api/search/type')
def search_by_type():
    types = request.args.getlist('types')
    pets = load_pets()
    if not types:
        return jsonify([])
    results = []
    for p in pets:
        pet_types = p.get('types', [])
        if all(t in pet_types for t in types):
            results.append(p)
    return jsonify(results)

@app.route('/api/types')
def get_types():
    type_chart = load_type_chart()
    return jsonify(list(type_chart.keys()))

@app.route('/api/type_relations')
def get_type_relations():
    pet_name = request.args.get('name', '').strip()
    if not pet_name:
        return jsonify({'error': '请输入精灵名称'}), 400

    pets = load_pets()
    pet = None
    for p in pets:
        if p['name'] == pet_name:
            pet = p
            break

    if not pet:
        return jsonify({'error': f'未找到精灵: {pet_name}'}), 404

    type_chart = load_type_chart()
    pet_types = pet.get('types', [])

    strong_against = set()
    weak_against = set()

    for pet_type in pet_types:
        if pet_type not in type_chart:
            continue
        for target_type, multiplier in type_chart[pet_type].items():
            if multiplier > 1.0:
                strong_against.add(target_type)

    for target_type in type_chart:
        for pet_type in pet_types:
            if pet_type not in type_chart.get(target_type, {}):
                continue
            multiplier = type_chart[target_type][pet_type]
            if multiplier > 1.0:
                weak_against.add(target_type)

    return jsonify({
        'pet': pet,
        'strong_against': sorted(list(strong_against)),
        'weak_against': sorted(list(weak_against))
    })

@app.route('/api/pets/by_type')
def get_pets_by_type():
    target_type = request.args.get('type', '').strip()
    if not target_type:
        return jsonify([])

    pets = load_pets()
    results = [p for p in pets if target_type in p.get('types', [])]
    return jsonify(results)

@app.route('/api/type_relations_between')
def get_type_relations_between():
    pet_name = request.args.get('pet_name', '').strip()
    target_type = request.args.get('type', '').strip()

    if not pet_name or not target_type:
        return jsonify({'error': '参数不完整'}), 400

    pets = load_pets()
    pet = None
    for p in pets:
        if p['name'] == pet_name:
            pet = p
            break

    if not pet:
        return jsonify({'error': f'未找到精灵: {pet_name}'}), 404

    type_chart = load_type_chart()
    pet_types = pet.get('types', [])

    relations = []
    for pt in pet_types:
        if pt in type_chart and target_type in type_chart[pt]:
            mult = type_chart[pt][target_type]
            if mult > 1.0:
                relations.append({'from': pt, 'to': target_type, 'relation': 'strong', 'multiplier': mult})

    if target_type in type_chart:
        for pt in pet_types:
            if pt in type_chart[target_type]:
                mult = type_chart[target_type][pt]
                if mult > 1.0:
                    relations.append({'from': target_type, 'to': pt, 'relation': 'weak', 'multiplier': mult})

    same_type_pets = [p for p in pets if target_type in p.get('types', [])]

    has_strong = any(r['relation'] == 'strong' for r in relations)
    has_weak = any(r['relation'] == 'weak' for r in relations)
    if has_strong and has_weak:
        relation_type = 'both'
    elif has_strong:
        relation_type = 'strong'
    elif has_weak:
        relation_type = 'weak'
    else:
        relation_type = 'same'

    return jsonify({
        'pet': pet,
        'target_type': target_type,
        'relations': relations,
        'relation_type': relation_type,
        'same_type_pets': same_type_pets
    })

@app.route('/api/egg_groups')
def get_egg_groups():
    _, group_pets = load_egg_data()
    return jsonify(sorted(list(group_pets.keys())))

@app.route('/api/pets/by_egg_group')
def get_pets_by_egg_group():
    egg_group = request.args.get('group', '').strip()
    if not egg_group:
        return jsonify([])
    _, group_pets = load_egg_data()
    pet_names = group_pets.get(egg_group, [])
    pets = load_pets()
    pet_dict = {p['name']: p for p in pets}
    results = [pet_dict[n] for n in pet_names if n in pet_dict]
    return jsonify(results)

@app.route('/api/egg/breedable')
def get_breedable_pets():
    pet_name = request.args.get('name', '').strip()
    if not pet_name:
        return jsonify({'error': '请输入精灵名称'}), 400
    pet_egg_groups, group_pets = load_egg_data()
    if pet_name not in pet_egg_groups:
        return jsonify({'error': f'未找到精灵 "{pet_name}" 的蛋组信息', 'breedable': []}), 404
    my_groups = pet_egg_groups[pet_name]
    breedable_names = set()
    for g in my_groups:
        for p in group_pets.get(g, []):
            if p != pet_name:
                breedable_names.add(p)
    pets = load_pets()
    pet_dict = {p['name']: p for p in pets}
    results = [pet_dict[n] for n in breedable_names if n in pet_dict]
    return jsonify({
        'pet_name': pet_name,
        'egg_groups': my_groups,
        'breedable': results,
        'breedable_count': len(results)
    })

@app.route('/api/egg/search_pet')
def search_egg_pet():
    keyword = request.args.get('keyword', '').strip()
    if not keyword:
        return jsonify([])
    pet_egg_groups, _ = load_egg_data()
    matches = [name for name in pet_egg_groups if keyword.lower() in name.lower()]
    return jsonify(matches[:15])

@app.route('/knowledge-graph')
def knowledge_graph():
    filepath = os.path.join(os.path.dirname(__file__), 'pokemon_knowledge_graph.html')
    if not os.path.exists(filepath):
        return "Knowledge graph file not found", 404
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return content, 200, {'Content-Type': 'text/html; charset=utf-8'}

@app.route('/lib/<path:filename>')
def serve_lib(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'lib'), filename)

@app.route('/api/pet_names')
def get_pet_names():
    pets = load_pets()
    names = [p['name'] for p in pets]
    return jsonify(names)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)