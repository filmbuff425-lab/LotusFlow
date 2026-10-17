"""Encode existing pixel art without resizing or changing frame coordinates."""
from pathlib import Path
from PIL import Image
import json

root=Path(__file__).resolve().parents[1]/'dist/assets/pixel'
frames=json.loads((root/'frames.json').read_text())
for outfit in ('yellow','black'):
    source=Image.open(root/f'{outfit}-sprites-v2.png')
    source.save(root/f'{outfit}-sprites55.webp',quality=95,method=6)
    if outfit=='yellow':
        x,y,w,h=frames[outfit][0]
        source.crop((x,y,x+w,y+h)).save(root/'yellow-idle55.webp',quality=95,method=6)
