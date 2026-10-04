"""Web-optimise media in public/assets (idempotent).
- videos: H.264 720p, CRF 28, no audio (hero loops are muted), faststart. Masters stay on Wix (manifest.bestRenditionUrl).
- images: downscale anything wider than 2400px (next/image serves AVIF/WebP variants from these).
Updates public/assets/manifest.json and the width/height in content/**/*.json."""
import json, os, glob, subprocess, imageio_ffmpeg
from PIL import Image

FF = imageio_ffmpeg.get_ffmpeg_exe()
MAX_W = 2400
manifest = json.load(open('public/assets/manifest.json', encoding='utf-8'))
resized = {}
for e in manifest:
    path = 'public' + e['file']
    if e['kind'] == 'video' and not e.get('optimized'):
        tmp = path + '.tmp.mp4'
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', path, '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
                        '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', tmp], check=True)
        before = os.path.getsize(path); os.replace(tmp, path)
        e.update(optimized='h264 720p crf28, no audio', bytesOriginal=before, bytes=os.path.getsize(path))
        print('video', e['file'], before // 1_000_000, '->', e['bytes'] // 1_000_000, 'MB')
    elif e['kind'] == 'image' and e.get('width', 0) > MAX_W:
        with Image.open(path) as im:
            h = round(im.height * MAX_W / im.width)
            out = im.resize((MAX_W, h), Image.LANCZOS)
            kw = {'quality': 85, 'optimize': True, 'progressive': True} if im.format == 'JPEG' else {'optimize': True}
            if out.mode in ('RGBA', 'P') and im.format == 'JPEG': out = out.convert('RGB')
            out.save(path, im.format, **kw)
        e.update(originalWidth=e['width'], originalHeight=e['height'], width=MAX_W, height=h, bytes=os.path.getsize(path))
        resized[e['file']] = (MAX_W, h)
        print('image', e['file'], e['originalWidth'], '->', MAX_W)
json.dump(manifest, open('public/assets/manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

def fix(v):
    if isinstance(v, dict):
        if v.get('src') in resized and 'width' in v:
            v['width'], v['height'] = resized[v['src']]
        for x in v.values(): fix(x)
    elif isinstance(v, list):
        for x in v: fix(x)
for f in glob.glob('content/**/*.json', recursive=True):
    d = json.load(open(f, encoding='utf-8')); fix(d)
    json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('done; resized', len(resized))
