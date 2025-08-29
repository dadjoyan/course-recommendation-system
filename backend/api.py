from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uvicorn
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
jsonl_file = os.getenv("JSONL_FILE")
rag_file = os.getenv("RAG_FILE")

# --- مدل JSON ورودی ---
class RequestData(BaseModel):
    program: str
    term: int
    course: List[str]
    time: Dict[str, List[str]]

# --- بارگذاری داده‌های اولیه ---
def load_data_as_text(file_path):
    docs_text = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                doc = json.loads(line)
                docs_text.append(
                    f"رشته: {doc['program']}\n"
                    f"ترم: {doc['term']}\n"
                    f"نام درس: {doc['name']}\n"
                    f"تعداد واحد: {doc['units_text']}\n"
                    f"نوع: {doc['type']}\n"
                    f"پیش‌نیازها: {', '.join(doc['prerequisites']) if doc['prerequisites'] else 'ندارد'}\n"
                    f"هم‌نیازها: {', '.join(doc['corequisites']) if doc['corequisites'] else 'ندارد'}\n"
                )
            except:
                continue
    return "\n\n".join(docs_text)

all_text = load_data_as_text(jsonl_file)

# --- مدل Gemini برای مرحله اول ---
llm_first = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=google_api_key,
    temperature=0.7
)

prompt_template_first = """
شما یک دستیار هوشمند برای دانشجویان برای انتخاب واحد هستید.
تو باید با استفاده از اطلاعات برنامه درسی که زیر بهت میدم و با استفاده از اطلاعات ورودی کاربر دروسی که باید انتخاب کند را بهش بگی
. باید به پیشنیاز ها و دروس ترم قبلی که پاس نشده دقت کنی. اگر شخصی پیشنیاز درسی را پاس نکرده باشد نمیتواند آن درس را بردارد
. در اطلاعات ورودی کاربر منظور از ترم همان ترم جدیدی است که قرار است برود
. دروس مانده از ترم قبل همان دروسی هستند که از ترم های پیش مانده و پاس نکرده است
اطلاعات برنامه درسی:
{context}

اطلاعات ورودی کاربر:
رشته: {program}
ترم: {term}
دروس مانده: {courses}

لطفا در پاخ هیچ توضیحی اضافه نده فقط دروسی باید دانشجو انتخاب کند همراه اطلاعات ان دروس مثل تعداد واحد دروس همنیاز و پیشنیاز رو بده.
"""

QA_PROMPT = PromptTemplate(
    template=prompt_template_first,
    input_variables=["context", "program", "term", "courses", "time"]
)

# --- RAG ---
with open(rag_file, "r", encoding="utf-8") as f:
    rag_docs = json.load(f)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
texts = [doc["text"] for doc in rag_docs]
vector_store = FAISS.from_texts(texts, embeddings, metadatas=[doc["metadata"] for doc in rag_docs])

llm_rag = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=google_api_key,
    temperature=0.7
)

prompt_template_rag = PromptTemplate(
    input_variables=["context", "question"],
    template="شما یک دستیار هستید. بر اساس اطلاعات زیر پاسخ بدهید:\n\n{context}\n\nسوال: {question}"
)

rag_chain = RetrievalQA.from_chain_type(
    llm=llm_rag,
    retriever=vector_store.as_retriever(search_kwargs={"k": 250}),
    chain_type="stuff",
    chain_type_kwargs={"prompt": prompt_template_rag, "document_variable_name": "context"},
    return_source_documents=True
)

# --- FastAPI ---
app = FastAPI()

# اضافه کردن CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"], # پورت اپ React
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # پشتیبانی از OPTIONS
    allow_headers=["*"],
)
example_json = {
    "id": "ترم ۱_course_1",
    "name": "برنامه سازی کامپیوتر",
    "units_number": 3,
    "type": "پایه",
    "prerequisites": [],
    "corequisites": [],
    "time": ""
}


@app.post("/get_courses")
async def ask_question(request: RequestData):
    # مرحله ۱: گرفتن لیست دروس پیشنهادی
    first_answer = llm_first.invoke(
        QA_PROMPT.format(
            context=all_text,
            program=request.program,
            term=request.term,
            courses=", ".join(request.course),
            time=json.dumps(request.time, ensure_ascii=False)
        )
    ).content

    # مرحله ۲: اجرای RAG بر اساس لیست پیشنهادی
    rag_query = f"""از بین دروس زیر:
    {first_answer}

    هرکدام که کلاسی در تایم زیر داشتند را بنویس:
    {json.dumps(request.time, ensure_ascii=False)}

    اگر کلاسی دو تا تایم داشت و یکی از کلاس‌های آن با زمان ما مطابقت داشت موردی ندارد، هر دو کلاس آن را به صورت کامل بنویس.
    مثلا اگر تایمی که ما داریم برای روز یک‌شنبه است و یکی از دروس در دو روز یک‌شنبه و سه‌شنبه کلاس داشت، هنگام ارائه هر دو کلاس آن را کامل بنویس.

    خروجی که باید بدهی به صورت JSON باشد.
    برای مثال خروجی JSON به صورت زیر است:
    {json.dumps(example_json, ensure_ascii=False)}
    """
    rag_result = rag_chain({"query": rag_query})
    try:
            # پیدا کردن بخش JSON با regex
            json_match = re.search(r'```json\n([\s\S]*?)\n```', rag_result["result"])
            if json_match:
                json_str = json_match.group(1)
                parsed_result = json.loads(json_str)
                return parsed_result  # مستقیماً آرایه JSON رو برمی‌گردونیم
            else:
                return []  # اگر JSON پیدا نشد، آرایه خالی برگردون
    except Exception as e:
            print(f"Error parsing JSON from rag_result: {e}")
            return []  # در صورت خطا، آرایه خالی برگردون

# هندل کردن درخواست OPTIONS
@app.options("/ask")
async def options_ask():
    return {}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
