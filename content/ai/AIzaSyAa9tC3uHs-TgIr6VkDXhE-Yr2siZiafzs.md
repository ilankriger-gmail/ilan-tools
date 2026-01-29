# AIzaSyAa9tC3uHs-TgIr6VkDXhE-Yr2siZiafzs

<div><b><h1>AIzaSyAa9tC3uHs-TgIr6VkDXhE-Yr2siZiafzs</h1></b></div>
<div><b><br></b></div>
<div><b>python3 -m streamlit run app.py</b></div>
<div><b><br></b></div>
<div><b><br></b></div>
<div><b><br></b></div>
<div><b>Api google</b></div>
<div><b><br></b></div>
<div><b><br></b></div>
<div><b>from googleapiclient.discovery import build</b></div>
<div><b>import pandas as pd</b></div>
<div><b><br></b></div>
<div><b># --- COLE SUA CHAVE ABAIXO (Mantenha as aspas!) ---</b></div>
<div><b>API_KEY = 'AIzaSyAa9tC3uHs-TgIr6VkDXhE-Yr2siZiafzs' </b></div>
<div><b># --------------------------------------------------</b></div>
<div><b><br></b></div>
<div><b>YOUTUBE = build('youtube', 'v3', developerKey=API_KEY)</b></div>
<div><b><br></b></div>
<div><b>CANAIS = {</b></div>
<div><b>    'MrBeast': 'UCX6OQ3DkcsbYNE6H8uQQuVA',</b></div>
<div><b>    'MDMotivator': 'UCV60-YzrBdQBKHxvgeu9sIw',</b></div>
<div><b>    'Jimmy Darts': 'UC2BoMmoR5HSmz5-oS8_1ENw'</b></div>
<div><b>}</b></div>
<div><b><br></b></div>
<div><b>def buscar_videos(canal_id):</b></div>
<div><b>    try:</b></div>
<div><b>        request = YOUTUBE.search().list(part=&quotsnippet,id&quot, channelId=canal_id, order=&quotdate&quot, maxResults=5, type=&quotvideo&quot)</b></div>
<div><b>        response = request.execute()</b></div>
<div><b>        videos = []</b></div>
<div><b>        for item in response['items']:</b></div>
<div><b>            vid_id = item['id']['videoId']</b></div>
<div><b>            stats = YOUTUBE.videos().list(part=&quotstatistics&quot, id=vid_id).execute()</b></div>
<div><b>            views = int(stats['items'][0]['statistics']['viewCount'])</b></div>
<div><b>            videos.append({'Titulo': item['snippet']['title'], 'Views': views})</b></div>
<div><b>        return videos</b></div>
<div><b>    except Exception as e:</b></div>
<div><b>        print(f&quotErro no canal {canal_id}: {e}&quot)</b></div>
<div><b>        return []</b></div>
<div><b><br></b></div>
<div><b>print(&quot</b>🚀<b> Iniciando varredura...&quot)</b></div>
<div><b>for nome, id_canal in CANAIS.items():</b></div>
<div><b>    print(f&quot\n</b>📊<b> {nome}:&quot)</b></div>
<div><b>    dados = buscar_videos(id_canal)</b></div>
<div><b>    df = pd.DataFrame(dados)</b></div>
<div><b>    if not df.empty:</b></div>
<div><b>        print(df.to_string(index=False))</b></div>
<div><b>    else:</b></div>
<div><b>        print(&quotSem dados.&quot)</b></div>

