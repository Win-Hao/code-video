#!/usr/bin/env python3
"""Two small self-check tools (need Pillow).

  python3 check.py colors still.png [more.png ...]
      Count the colors in rendered stills (pixel art: "no more than 16"). Count a rendered PNG,
      not the MP4: compression always adds colors.

  python3 check.py loop last.png first.png [a.png b.png]
      Whether a loop closes: how many pixels clearly change from the last frame to the first.
      Give two ordinary neighboring frames a, b as a baseline and it says whether the loop closes
      (the seam may change at most about twice as many pixels as an ordinary frame step).
"""
import sys
from PIL import Image, ImageChops

def colors(p):
    im = Image.open(p).convert('RGB')
    n = len(im.getcolors(maxcolors=1 << 24) or [])
    print(f'{p}: {n} colors')

def changed(a, b):
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    diff = ImageChops.difference(ia, ib).convert('L')
    return sum(diff.histogram()[9:]) / (ia.width * ia.height)  # share of pixels that differ by more than 8

def loop(last, first, a=None, b=None):
    seam = changed(last, first)
    print(f'seam (last -> first): {seam:.2%} of pixels clearly change')
    if a and b:
        base = changed(a, b)
        print(f'ordinary frame step:  {base:.2%}')
        if seam <= max(2 * base, 0.001):
            print('-> the loop closes')
        elif base:
            print(f'-> the loop does not close: the seam changes {seam / base:.1f}x as many pixels as an ordinary step')
        else:
            print('-> the loop does not close: the picture is otherwise still, but it jumps at the seam')

if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == 'colors':
        for p in sys.argv[2:]: colors(p)
    elif len(sys.argv) in (4, 6) and sys.argv[1] == 'loop':
        loop(*sys.argv[2:])
    else:
        print(__doc__)
