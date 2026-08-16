#!/usr/bin/env python3
"""
build_tasks.py - 任务数据编译脚本

把 src/data/tasks.ts 中的 mockTasks 数组编译成两个 JSON：
  1. tasks.json                - 任务列表（薄，含详情 URL）
  2. data/tasks/<task_id>.json - 任务详情（厚，含 villages 数组）

输出路径：/data/oss_build/tasks/
上传命令：ossutil cp /data/oss_build/tasks/tasks.json oss://flash-map-web/data/tasks/
         ossutil cp /data/oss_build/tasks/<task_id>.json oss://flash-map-web/data/tasks/

Usage:
  python3 scripts/build_tasks.py
"""
import json
import re
import sys
from pathlib import Path
from datetime import datetime, timezone

# 路径
REPO_ROOT = Path(__file__).resolve().parent.parent
TASKS_TS = REPO_ROOT / 'src' / 'data' / 'tasks.ts'
OUTPUT_DIR = Path('/data/oss_build/tasks')

# 列表 JSON 在 OSS 上的根 URL（前端 fetch 用）
LIST_BASE_URL = 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tasks'


def parse_mock_tasks(ts_content: str) -> list:
    """保留备用，目前不再使用。"""
    pattern = re.compile(
        r'export\s+const\s+mockTasks\s*:\s*Task\[\]\s*=\s*(\[[\s\S]*?\n\]);',
        re.MULTILINE,
    )
    m = pattern.search(ts_content)
    if not m:
        raise ValueError('没找到 mockTasks 数组定义')
    return m.group(1)


def extract_via_node(ts_path: Path) -> list:
    """
    用 Node 24+ 内置 --experimental-strip-types 直接执行 TS 文件。
    把 mockTasks 数组 dump 成 JSON。
    """
    import subprocess
    import tempfile

    # 包装一段 .mjs 文件，import tasks.ts 然后 dump JSON
    wrapper = f"""
import {{ mockTasks }} from '{ts_path}';
console.log(JSON.stringify(mockTasks));
"""
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.mjs', delete=False, encoding='utf-8'
    ) as f:
        f.write(wrapper)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [
                'node',
                '--experimental-strip-types',
                '--no-warnings',
                tmp_path,
            ],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if result.returncode != 0:
            print('Node stderr:', result.stderr, file=sys.stderr)
            raise RuntimeError(f'Node 退出码 {result.returncode}')
        return json.loads(result.stdout.strip())
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def build_list(task: dict) -> dict:
    """列表项（薄，不含 villages 数组）。"""
    return {
        'id': task['id'],
        'name': task['name'],
        'region': {
            'province': task['province'],
            'city': task['city'],
            'county': task['county'],
            'town': task.get('town'),
        },
        'taskTime': task['taskTime'],
        'villageCount': task['villageCount'],
        'totalArea': task['totalArea'],
        'status': task['status'],
        'zoomRange': task.get('zoomRange'),
        'center': task['center'],
        'detailUrl': f'{LIST_BASE_URL}/{task["id"]}.json',
    }


def build_detail(task: dict) -> dict:
    """详情项（完整，含 villages 数组）。"""
    return task


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f'📖 读取 {TASKS_TS}')
    tasks = extract_via_node(TASKS_TS)
    print(f'✅ 解析到 {len(tasks)} 个任务')

    # 生成列表 JSON
    list_data = {
        'updatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'sourceVersion': 1,
        'count': len(tasks),
        'tasks': [build_list(t) for t in tasks],
    }
    list_path = OUTPUT_DIR / 'tasks.json'
    list_path.write_text(
        json.dumps(list_data, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    print(f'📝 列表: {list_path} ({list_path.stat().st_size} bytes)')

    # 生成每个任务的详情 JSON
    for task in tasks:
        detail_path = OUTPUT_DIR / f'{task["id"]}.json'
        detail_path.write_text(
            json.dumps(build_detail(task), ensure_ascii=False, indent=2),
            encoding='utf-8',
        )
        print(f'📝 详情: {detail_path} ({detail_path.stat().st_size} bytes)')

    print(f'\n✅ 完成！输出目录: {OUTPUT_DIR}')
    print(f'\n📤 上传命令：')
    print(f'   ossutil cp {OUTPUT_DIR}/tasks.json oss://flash-map-web/data/tasks/')
    for task in tasks:
        print(
            f'   ossutil cp {OUTPUT_DIR}/{task["id"]}.json '
            f'oss://flash-map-web/data/tasks/'
        )


if __name__ == '__main__':
    main()
