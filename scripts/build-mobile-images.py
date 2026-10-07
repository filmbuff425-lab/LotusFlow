"""Create phone-sized derivatives; never replace an original image."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import json

root = Path(__file__).resolve().parent.parent
source = root / 'dist'
destination = source / 'assets/mobile'
destination.mkdir(parents=True, exist_ok=True)
images = {}
original_bytes = phone_bytes = 0
for file in sorted((source / 'assets').rglob('*')):
    if file.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp') or destination in file.parents:
        continue
    relative = file.relative_to(source).as_posix()
    # Keep the blade itself and pixel sprites in their approved original form.
    if 'katana' in relative or '/characters/' in relative or '/fonts/' in relative:
        continue
    cap = 512
    if '/artists/' in relative:
        cap = 768
    elif '/recognition/awards/' in relative:
        cap = 1600
    elif 'la-downtown' in relative or 'studio-earth-rim' in relative:
        cap = 1024
    with Image.open(file) as image:
        if max(image.size) <= cap or getattr(image, 'is_animated', False):
            continue
        identity = hashlib.sha256(file.read_bytes()+f'/phone/{cap}/v1'.encode()).hexdigest()[:16]
        output = destination / f'{file.stem}-{identity}.webp'
        if not output.exists():
            copy = ImageOps.exif_transpose(image)
            copy.thumbnail((cap, cap), Image.Resampling.LANCZOS)
            copy.save(output, 'WEBP', quality=90, method=6)
        images[relative] = output.relative_to(source).as_posix()
        original_bytes += file.stat().st_size
        phone_bytes += output.stat().st_size
(source/'mobile-images.js').write_text('// Generated phone derivatives. Desktop uses the original assets.\nexport const mobileImages='+json.dumps(images, ensure_ascii=False, separators=(',', ':'))+';\n')
print(json.dumps({'variants':len(images),'originalMiB':round(original_bytes/1048576,2),'phoneMiB':round(phone_bytes/1048576,2)}))
