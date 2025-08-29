import requests
import json

url = "http://localhost:8000/get_courses"

payload = json.dumps({
  "program": "مهندسی کامپیوتر برای ورودی های 1401 و ماقبل",
  "term": 3,
  "course": [
    "فیزیک ۲",
    "مدارهای منطقی"
  ],
  "time": {
    "یکشنبه": [
      "10:00-12:00",
      "08:00-10:00"
    ]
  }
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
