import asyncio
from app.services.nlp_engine import nlp_engine
from app.core.config import settings
print(f"Key present: {bool(settings.OPENAI_API_KEY)}")
async def test():
    try:
        res = await nlp_engine.process_query("I'm looking for a dark psychological thriller")
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()
asyncio.run(test())
