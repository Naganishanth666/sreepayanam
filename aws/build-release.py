"""Build a Linux Lambda artifact without changing the application's lockfiles."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--node', type=Path, required=True)
parser.add_argument('--npm-cli', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = args.output.resolve()
output.mkdir(parents=True, exist_ok=False)
stage = output / 'lambda'
stage.mkdir()

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

original_locks = {name: sha256(root / name / 'package-lock.json') for name in ('backend', 'frontend')}
env = os.environ.copy()
env['PATH'] = str(args.node.parent) + os.pathsep + env.get('PATH', '')
for name in ('backend', 'shared'):
    shutil.copytree(root / name, stage / name,
                    ignore=shutil.ignore_patterns('node_modules', 'test', '.env', '.env.*', '*.log', '.git'))
for name in ('package.json', 'package-lock.json', 'bootstrap.cjs', 'run.sh'):
    shutil.copyfile(root / 'aws' / 'runtime' / name, stage / name)
for directory in (stage, stage / 'backend'):
    subprocess.run([str(args.node), str(args.npm_cli), 'ci', '--omit=dev', '--os=linux',
                    '--cpu=x64', '--libc=glibc', '--ignore-scripts', '--no-audit', '--no-fund'],
                   cwd=directory, env=env, check=True)

native_files = list(stage.rglob('*.node'))
if not native_files or not any('canvas-linux-x64-gnu' in str(path) for path in native_files):
    raise RuntimeError('The Linux PDF canvas dependency is missing.')
for path in native_files:
    if path.read_bytes()[:4] != b'\x7fELF':
        raise RuntimeError('A native dependency is not a Linux ELF binary: ' + path.name)
for name, digest in original_locks.items():
    if sha256(root / name / 'package-lock.json') != digest:
        raise RuntimeError('An original application lockfile was changed.')

archive = output / 'backend.zip'
total = 0
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as package:
    for path in sorted(stage.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(stage).as_posix()
        if path.name == '.env' or path.name.startswith('.env.'):
            raise RuntimeError('Environment files must never enter deployment artifacts.')
        data = path.read_bytes()
        if relative == 'run.sh':
            data = data.replace(b'\r\n', b'\n')
        info = zipfile.ZipInfo(relative)
        info.create_system = 3
        info.external_attr = (0o100755 if relative == 'run.sh' else 0o100644) << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        package.writestr(info, data)
        total += len(data)
if total > 240 * 1024 * 1024:
    raise RuntimeError('The artifact leaves insufficient space for the Lambda adapter layer.')
manifest = {'sha256': sha256(archive), 'zipBytes': archive.stat().st_size,
            'unpackedBytes': total, 'linuxNativeFiles': len(native_files),
            'applicationLockHashes': original_locks}
(output / 'release.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(manifest))
