import urllib.request
urls=['http://localhost:8000/api/','http://localhost:8000/api/equipment/','http://localhost:8000/api/requests/','http://localhost:8000/api/calendar/']
for u in urls:
    try:
        r=urllib.request.urlopen(u, timeout=5)
        print(f"{u} => {r.getcode()}")
    except Exception as e:
        print(f"{u} => ERROR {e}")
