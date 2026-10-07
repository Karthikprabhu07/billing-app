import sys
from PIL import Image

def crop_icon():
    img_path = r"C:\Users\devil\.gemini\antigravity\brain\cd31a973-e9bf-475e-8b2e-74f981113d46\media__1773929781892.jpg"
    img = Image.open(img_path).convert("RGB")
    
    # invert and grab bbox to find non-white region
    inv = Image.eval(img, lambda x: 255 - x)
    mask = inv.convert("L").point(lambda x: 255 if x > 10 else 0)
    bbox = mask.getbbox()
    
    if bbox:
        cropped = img.crop(bbox)
        target1 = r"c:\Users\devil\.gemini\antigravity\scratch\karthik-billing-app\public\logo.jpg"
        target2 = r"c:\Users\devil\.gemini\antigravity\scratch\karthik-billing-app\assets\icon.jpg"
        cropped.save(target1)
        cropped.save(target2)
        print("Cropped successfully to", bbox)
    else:
        print("Could not find bounding box")

if __name__ == '__main__':
    crop_icon()
