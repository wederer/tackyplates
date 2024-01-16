from datetime import datetime
import pandas as pd
import asyncio

async def measure(position):
    mock_values = [20, 19, 18, 17.5, 17, 16.7, 16.5, 16.3, 15, 13, 12, 8, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1]
    date_times = []
    for i in range(len(mock_values)):
        await asyncio.sleep(0.1)
        date_times.append(datetime.now())

    return pd.DataFrame({
        "times": date_times,
        "values": mock_values,
    })
