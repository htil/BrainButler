import sys
import json
import re

assert len(sys.argv) == 3

instream = sys.argv[1]
outstream = sys.argv[2]

with open(instream, "r", encoding="utf-8") as r:
	text = r.read().strip()
	#text = re.sub("\n+", "\n", text) #Remove duplicate newlines
with open(outstream, "w", encoding="utf-8") as w:
	w.write(json.dumps({"text": text}))
