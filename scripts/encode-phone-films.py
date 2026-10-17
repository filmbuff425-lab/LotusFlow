"""Make phone-only H.264/AAC streams; retain the original desktop masters.
Usage: python3 scripts/encode-phone-films.py /path/to/ffmpeg
"""
import pathlib, subprocess, sys
root=pathlib.Path(__file__).resolve().parents[1]/'dist'
out=root/'assets/phone-films53';out.mkdir(exist_ok=True)
films={'show-me-love':'show-me-love-tia-ray-20261006'}
for name,source in films.items():
 src=root/f'assets/mv/{source}.mp4';dest=out/f'{name}-mobile53.mp4'
 subprocess.run([sys.argv[1],'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-map','0:a:0','-vf','scale=640:-2,fps=24','-c:v','libx264','-preset','fast','-crf','25','-maxrate','550k','-bufsize','1100k','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','80k','-ar','44100','-movflags','+faststart',str(dest)],check=True)
 print(f'{name}: {dest.stat().st_size} bytes ({dest.stat().st_size/src.stat().st_size:.0%} of original)',flush=True)

 subprocess.run([sys.argv[1],'-v','error','-y','-ss','3','-i',str(src),'-frames:v','1','-vf','scale=640:-2',str(out/f'{name}-mobile53.jpg')],check=True)
