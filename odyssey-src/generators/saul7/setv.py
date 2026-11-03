# 2026-11-03부터 캐시 번호는 odyssey-src/build.py가 계산한다. 예전 호출을 그대로 써도 빌드로 이어지게 둔다.
import subprocess, sys
sys.exit(subprocess.run([sys.executable, 'E:/서브 브레인/Projects/malsseum-umul/odyssey-src/build.py']).returncode)
