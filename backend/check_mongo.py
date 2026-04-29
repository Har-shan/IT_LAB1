from pymongo import MongoClient
db = MongoClient("mongodb://localhost:27017/")["scis_timetable"]

print("=== MongoDB Collections ===")
for col in sorted(db.list_collection_names()):
    print(f"  {col:<25} {db[col].count_documents({})} documents")

print("\n=== Users by role ===")
for r in db.users.aggregate([{"$group": {"_id": "$role", "count": {"$sum": 1}}}]):
    print(f"  {r['_id']:<15} {r['count']}")

print("\n=== Timetable by stream ===")
for r in db.timetable_entries.aggregate([
    {"$group": {"_id": "$stream", "count": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]):
    print(f"  {r['_id']:<20} {r['count']} entries")

print("\n=== Timetable by day ===")
for r in db.timetable_entries.aggregate([
    {"$group": {"_id": "$day", "count": {"$sum": 1}}},
    {"$sort": {"_id": 1}}
]):
    print(f"  {r['_id']:<15} {r['count']} entries")

print("\n=== Monday M.Tech(CS) schedule ===")
for e in db.timetable_entries.find(
    {"day": "Monday", "stream": "M.Tech(CS)"}
).sort("start_time", 1):
    print(f"  {e['start_time']}-{e['end_time']}  {e['subject_name'][:30]:<30}  {e['faculty_name']:<20}  {e['room_name']}  [{e['type']}]")

print("\n=== Dr. SAM's schedule ===")
sam = db.users.find_one({"email": "sam@uohyd.ac.in"})
for e in db.timetable_entries.find({"faculty_id": str(sam["_id"])}).sort([("day",1),("start_time",1)]):
    print(f"  {e['day']:<12} {e['start_time']}-{e['end_time']}  {e['subject_name']:<30}  {e['stream']}")
