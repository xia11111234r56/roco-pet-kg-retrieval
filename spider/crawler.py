import time
import random
import json
import os
import re
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://wiki.biligame.com/rocom"
PET_LIST_URL = f"{BASE_URL}/精灵图鉴"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

TYPE_MAP = {
    "普通": "一般系",
    "草": "草系",
    "火": "火系",
    "水": "水系",
    "光": "光系",
    "地": "地面系",
    "冰": "冰系",
    "龙": "龙系",
    "电": "电系",
    "毒": "毒系",
    "虫": "虫系",
    "武": "格斗系",
    "翼": "飞行系",
    "萌": "超能力系",
    "幽": "幽灵系",
    "恶": "恶系",
    "机械": "钢系",
    "幻": "妖精系"
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

session = requests.Session()
session.headers.update(HEADERS)

def random_delay():
    time.sleep(random.uniform(1.5, 3.0))

def normalize_type(raw_type):
    raw_type = raw_type.strip()
    if raw_type in TYPE_MAP:
        return TYPE_MAP[raw_type]
    if not raw_type.endswith("系"):
        return raw_type + "系"
    return raw_type

def parse_evolution_stage(text):
    if not text:
        return "未知"
    roman_map = {"I": "一阶", "II": "二阶", "III": "三阶", "IV": "四阶"}
    text = text.strip()
    for roman, chinese in roman_map.items():
        if roman in text:
            return chinese
    if "最终" in text:
        return "最终形态"
    if "地区" in text:
        return "地区形态"
    if "首领" in text:
        return "首领形态"
    return text

def fetch_page(url):
    random_delay()
    try:
        resp = session.get(url, timeout=15)
        resp.encoding = 'utf-8'
        return resp.text
    except Exception as e:
        print(f"  请求失败 {url}: {e}")
        return None

def crawl_pet_list():
    print("[1/2] 正在爬取精灵图鉴列表页...")
    html = fetch_page(PET_LIST_URL)
    if not html:
        print("  列表页请求失败")
        return []

    soup = BeautifulSoup(html, 'lxml')
    pets = []
    seen_names = set()

    tables = soup.find_all('table')
    print(f"  找到 {len(tables)} 个表格")

    for table_idx, table in enumerate(tables):
        rows = table.find_all('tr')
        if len(rows) < 2:
            continue

        for row in rows[1:]:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue

            try:
                pet = {}
                first_cell = cells[0]
                img_tag = first_cell.find('img')
                link_tag = first_cell.find('a')

                if link_tag and link_tag.get('title'):
                    pet['name'] = link_tag['title'].strip()
                elif img_tag and img_tag.get('alt'):
                    pet['name'] = img_tag['alt'].strip()
                else:
                    pet['name'] = first_cell.get_text(strip=True)

                if not pet['name'] or pet['name'] in seen_names or len(pet['name']) < 2:
                    continue

                pet['detail_url'] = None
                if link_tag and link_tag.get('href'):
                    href = link_tag['href']
                    if href.startswith('/'):
                        pet['detail_url'] = f"https://wiki.biligame.com{href}"
                    elif href.startswith('http'):
                        pet['detail_url'] = href
                    else:
                        pet['detail_url'] = f"{BASE_URL}/{href}"

                type_cell = cells[1] if len(cells) > 1 else None
                if type_cell:
                    type_text = type_cell.get_text(strip=True)
                    pet['types'] = [normalize_type(t) for t in re.split(r'[/、,，\s]+', type_text) if t.strip() and len(t.strip()) > 0]
                else:
                    pet['types'] = []

                stage_cell = cells[2] if len(cells) > 2 else None
                if stage_cell:
                    stage_text = stage_cell.get_text(strip=True)
                    pet['evolution_stage'] = parse_evolution_stage(stage_text)
                else:
                    pet['evolution_stage'] = "未知"

                if len(cells) > 3:
                    stats_text = cells[3].get_text(strip=True)
                    pet['base_stats_text'] = stats_text

                pet['image_url'] = ''
                if img_tag:
                    img_src = img_tag.get('src', '') or img_tag.get('data-src', '')
                    if img_src:
                        if img_src.startswith('//'):
                            pet['image_url'] = 'https:' + img_src
                        elif img_src.startswith('/'):
                            pet['image_url'] = f"https://wiki.biligame.com{img_src}"
                        else:
                            pet['image_url'] = img_src

                seen_names.add(pet['name'])
                pets.append(pet)
                print(f"  发现精灵: {pet['name']} ({', '.join(pet['types'])})")

            except Exception as e:
                continue

    print(f"  共发现 {len(pets)} 只精灵")
    return pets

def crawl_pet_detail(pet):
    if not pet.get('detail_url'):
        return pet

    print(f"  正在获取详情: {pet['name']}...")
    html = fetch_page(pet['detail_url'])
    if not html:
        return pet

    soup = BeautifulSoup(html, 'lxml')

    pet['skills'] = extract_skills(soup)
    pet['traits'] = extract_traits(soup)
    pet['description'] = extract_description(soup)
    pet['evolves_to'] = extract_evolution(soup, pet['name'])
    pet['stats'] = extract_stats(soup)

    return pet

def extract_skills(soup):
    skills = []
    tables = soup.find_all('table')
    for table in tables:
        header_row = table.find('tr')
        if not header_row:
            continue
        header_text = header_row.get_text()
        if '技能' not in header_text:
            continue

        rows = table.find_all('tr')[1:]
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 2:
                skill_name = cells[0].get_text(strip=True)
                if skill_name and skill_name not in ['技能', '名称']:
                    skill = {'name': skill_name}
                    if len(cells) > 1:
                        skill['type'] = normalize_type(cells[1].get_text(strip=True))
                    if len(cells) > 2:
                        power_text = cells[2].get_text(strip=True)
                        match = re.search(r'(\d+)', power_text)
                        skill['power'] = int(match.group(1)) if match else power_text
                    skills.append(skill)
        if skills:
            break
    return skills

def extract_traits(soup):
    traits = []
    for tag in soup.find_all(['td', 'th', 'div', 'span']):
        text = tag.get_text(strip=True)
        if text == '特性' or text == '专属特性':
            parent = tag.find_parent('table') or tag.find_parent('div')
            if parent:
                for item in parent.find_all(['td', 'li']):
                    t = item.get_text(strip=True)
                    if t and t not in ['特性', '专属特性', ''] and len(t) > 1:
                        traits.append(t)
            break
    return traits

def extract_description(soup):
    for tag in soup.find_all(['p', 'div']):
        text = tag.get_text(strip=True)
        if len(text) > 20:
            return text
    return ""

def extract_evolution(soup, current_name):
    for a_tag in soup.find_all('a'):
        title = a_tag.get('title', '')
        href = a_tag.get('href', '')
        link_text = a_tag.get_text(strip=True)
        if title and title != current_name and len(title) > 1:
            if '进化' in href.lower() or '进化' in link_text:
                return title
    return None

def extract_stats(soup):
    stats = {}
    stat_map = {
        '生命': 'hp', 'HP': 'hp', '体力': 'hp',
        '攻击': 'attack', '物攻': 'attack',
        '防御': 'defense', '物防': 'defense',
        '魔攻': 'sp_attack', '法攻': 'sp_attack',
        '魔抗': 'sp_defense', '法防': 'sp_defense',
        '速度': 'speed',
    }

    for tag in soup.find_all(['td', 'th']):
        text = tag.get_text(strip=True)
        for cn_name, en_name in stat_map.items():
            if cn_name in text and en_name not in stats:
                match = re.search(r'(\d+)', text)
                if match:
                    stats[en_name] = int(match.group(1))
                break

    return stats

def save_pets(pets):
    os.makedirs(DATA_DIR, exist_ok=True)
    output_file = os.path.join(DATA_DIR, 'pets.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(pets, f, ensure_ascii=False, indent=4)
    print(f"\n数据已保存到 {output_file}")

def run_crawler(max_details=50):
    print("=" * 50)
    print("洛克王国世界 - 精灵数据采集")
    print("=" * 50)

    pets = crawl_pet_list()

    if not pets:
        print("未爬取到任何精灵数据，请检查网页结构是否变化")
        print("提示: BWIKI可能使用动态加载，请尝试在本地使用Selenium模式运行")
        return

    print(f"\n[2/2] 开始爬取精灵详情（最多 {max_details} 只）...")
    for i, pet in enumerate(pets[:max_details]):
        print(f"\n进度: {i+1}/{min(max_details, len(pets))}")
        crawl_pet_detail(pet)

    save_pets(pets)
    print(f"\n爬取完成！共 {len(pets)} 只精灵")

if __name__ == '__main__':
    run_crawler()
