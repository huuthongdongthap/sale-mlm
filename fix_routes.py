#!/usr/bin/env python3
path = "/Users/mac/mekong-cli/SALE MLM/src/workers/index.js"
with open(path) as f:
    src = f.read()

# 1. Remove auth guard from /api/habits GET
old1 = "if (path === '/api/habits' && method === 'GET') { await authMiddleware(request, env); return await handleListHabits(request, env); }"
new1 = "if (path === '/api/habits' && method === 'GET') return await handleListHabits(request, env);"

# 2. Add /api/onboarding/active route before onboarding start
old2 = "if (path === '/api/onboarding/start' && method === 'POST') return await handleOnboardingStart(request, env);"
new2 = "if (path === '/api/onboarding/active' && method === 'GET') return await handleOnboardingActive(env);\nif (path === '/api/onboarding/start' && method === 'POST') return await handleOnboardingStart(request, env);"

count = 0
if old1 in src:
    src = src.replace(old1, new1)
    count += 1
else:
    print("WARN: habits GET not found as expected")

if old2 in src:
    src = src.replace(old2, new2)
    count += 1
else:
    print("WARN: onboarding/start not found as expected")

with open(path, 'w') as f:
    f.write(src)
print(f"Applied {count} fixes.")
