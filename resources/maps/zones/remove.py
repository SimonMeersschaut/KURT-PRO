import glob
import os

for file in glob.glob("*/compression.json"):
    os.remove(file)