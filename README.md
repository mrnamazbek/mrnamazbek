<!-- Dynamic Gradient Wave Header -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,5,6&height=200&section=header&text=NAMAZBEK%20BEKZHANOV&fontSize=50&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Big%20Data%20%E2%80%A2%20Machine%20Learning%20%E2%80%A2%20Software%20Engineering&descSize=16&descAlignY=53" />

<div align="center">

<!-- Multi-line Terminal Simulation -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=800&color=00F7F7&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=120&lines=%E2%9A%A1+user%40kbtu%3A~%24+./init.sh;%F0%9F%94%A5+Initializing+Data+Engineer...;%F0%9F%A7%A0+Loading+ML+Models...;%E2%9C%85+System+Ready!+Welcome." alt="Typing SVG" />
</a>

<!-- Status Badges Row 1 -->
<p>
<img src="https://img.shields.io/badge/🌍_Location-Almaty,_Kazakhstan-e74c3c?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/💼_Role-Data_Engineer-3498db?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/🎓_Degree-MSc_Student-27ae60?style=for-the-badge&labelColor=2c3e50" />
</p>

<!-- Status Badges Row 2 -->
<p>
<img src="https://img.shields.io/badge/⚽_Captain-Football_Team-f39c12?style=for-the-badge&labelColor=2c3e50" />
<img src="https://img.shields.io/badge/💻_Company-Freedom_Finance-9b59b6?style=for-the-badge&labelColor=2c3e50" />
</p>

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<br/>

## 🧬 `$ python3 profile.py --execute`

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════╗
║  PROFESSIONAL PROFILE: Namazbek Bekzhanov                    ║
║  Role: Big Data Engineer | ML Specialist                     ║
║  Organization: Freedom Finance Insurance                     ║
╚══════════════════════════════════════════════════════════════╝
"""

from typing import List, Dict
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Engineer:
    """Data-driven professional focused on scalable solutions."""
    
    name: str = "Namazbek Bekzhanov"
    role: str = "Big Data Engineer & ML Enthusiast"
    location: str = "Almaty, Kazakhstan 🇰🇿"
    company: str = "Freedom Finance Insurance"
    
    education: Dict[str, str] = None
    languages: List[str] = None
    stack: Dict[str, List[str]] = None
    
    def __post_init__(self):
        self.education = {
            "🎓 Current": "MSc in Data Science @ KBTU (2025-2027)",
            "🎓 Completed": "BSc in Computer Science @ SDU (2021-2025)"
        }
        
        self.languages = ["Python", "Go", "Java", "SQL", "Bash"]
        
        self.stack = {
            "big_data": ["Spark", "Hadoop", "Airflow", "Kafka"],
            "ml_ai": ["Scikit-Learn", "TensorFlow", "PyTorch", "Keras"],
            "databases": ["PostgreSQL", "Oracle", "MySQL", "MSSQL"],
            "devops": ["Docker", "Git", "Linux", "CI/CD"],
            "frameworks": ["FastAPI", "Pandas", "NumPy"]
        }
    
    def current_mission(self) -> List[str]:
        """My daily engineering adventures."""
        return [
            "🔥 Architecting scalable ETL/ELT data pipelines",
            "🧠 Building production ML models for real impact",
            "🐘 Orchestrating big data workflows (Airflow + Spark)",
            "⚡ Optimizing database performance & queries",
            "⚽ Leading teammates to victory on & off the field"
        ]
    
    def get_expertise_matrix(self) -> Dict[str, int]:
        """Skill proficiency levels (out of 10)."""
        return {
            "Python Development": 9,
            "Data Engineering": 9,
            "Machine Learning": 8,
            "Big Data (Spark/Hadoop)": 8,
            "Database Design": 9,
            "Cloud Architecture": 7,
            "Football Strategy": 10  # ⚽
        }
    
    def philosophy(self) -> str:
        return "Code is poetry. Data tells stories. I write both."


def main():
    me = Engineer()
    
    print(f"\n{'='*60}")
    print(f"👋 Hello, World! I'm {me.name}")
    print(f"📍 Based in {me.location}")
    print(f"💼 {me.role} @ {me.company}")
    print(f"{'='*60}\n")
    
    print("🎯 CURRENT MISSION:")
    for mission in me.current_mission():
        print(f"   {mission}")
    
    print(f"\n💡 PHILOSOPHY: {me.philosophy()}\n")


if __name__ == "__main__":
    main()
```

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🏆 Achievement Showcase

<div align="center">
  
<!-- Trophies -->
<img src="https://github-profile-trophy.vercel.app/?username=mrnamazbek&theme=algolia&no-frame=true&no-bg=false&margin-w=4&row=1&column=8" width="100%" />

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🎨 Data Engineering Architecture

<div align="center">

```mermaid
graph TD;
    subgraph DATA_SOURCES
    A[APIs] --> B[Spark]
    C[Databases] --> B
    D[Kafka] --> B
    end
    
    subgraph PROCESSING
    B --> E[Transform]
    E --> F[Cleanse]
    F --> G[Validate]
    end
    
    subgraph STORAGE
    G --> H[PostgreSQL]
    G --> I[Oracle]
    G --> J[S3/HDFS]
    end
    
    subgraph ML_PIPELINE
    K[Sklearn] --> L[FastAPI]
    M[TensorFlow] --> L
    N[PyTorch] --> L
    end
    
    subgraph DEPLOYMENT
    L --> O[Docker]
    O --> P[Kubernetes]
    end
    
    subgraph MONITORING
    P --> Q[Grafana]
    P --> R[Prometheus]
    P --> S[Logs]
    end
```

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## ⚡ Technology Arsenal

<details open>
<summary><b>🧠 Machine Learning & AI</b></summary>
<br/>

<div align="center">

![Scikit-learn](https://img.shields.io/badge/Scikit--Learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white)
![Keras](https://img.shields.io/badge/Keras-%23D00000.svg?style=for-the-badge&logo=Keras&logoColor=white)
![NumPy](https://img.shields.io/badge/Numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)

</div>
</details>

<details open>
<summary><b>🐘 Big Data & Orchestration</b></summary>
<br/>

<div align="center">

![Apache Spark](https://img.shields.io/badge/Apache%20Spark-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white)
![Hadoop](https://img.shields.io/badge/Apache%20Hadoop-66CCFF?style=for-the-badge&logo=apachehadoop&logoColor=black)
![Airflow](https://img.shields.io/badge/Apache%20Airflow-017CEE?style=for-the-badge&logo=Apache%20Airflow&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)

</div>
</details>

<details open>
<summary><b>💻 Programming Languages</b></summary>
<br/>

<div align="center">

![Python](https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Go](https://img.shields.io/badge/Go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![Java](https://img.shields.io/badge/Java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-025E8C?style=for-the-badge&logo=postgresql&logoColor=white)
![Bash](https://img.shields.io/badge/Bash-%23121011.svg?style=for-the-badge&logo=gnu-bash&logoColor=white)

</div>
</details>

<details open>
<summary><b>🗄️ Databases</b></summary>
<br/>

<div align="center">

![Postgres](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![MicrosoftSQLServer](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC2927?style=for-the-badge&logo=microsoft%20sql%20server&logoColor=white)

</div>
</details>

<details open>
<summary><b>🛠️ DevOps & Tools</b></summary>
<br/>

<div align="center">

![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

</div>
</details>

<details open>
<div align="center">

![PyCharm](https://img.shields.io/badge/PyCharm-21D789?style=for-the-badge&logo=pycharm&logoColor=white)
![DataGrip](https://img.shields.io/badge/DataGrip-DB3BDA?style=for-the-badge&logo=datagrip&logoColor=white)
![DataSpell](https://img.shields.io/badge/DataSpell-9775FA?style=for-the-badge&logo=datascience&logoColor=white)
![DBeaver](https://img.shields.io/badge/DBeaver-372923?style=for-the-badge&logo=dbeaver&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Antigravity](https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>
</details>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 🚀 Signature Projects
<div align="center">
<table>
<tr>
<td width="50%" valign="top">

### 🌊 Big Data Final
<i>Massive-scale stream processing</i>

**Architecture:**
```
Kafka → Spark → HDFS
  ↓       ↓       ↓
Stream  Process Store
```

**Tech Stack:**  
![Spark](https://img.shields.io/badge/-Spark-E25A1C?style=flat-square&logo=apachespark&logoColor=white)
![Hadoop](https://img.shields.io/badge/-Hadoop-66CCFF?style=flat-square&logo=apachehadoop&logoColor=black)
![Kafka](https://img.shields.io/badge/-Kafka-000?style=flat-square&logo=apachekafka)

**Impact:**  
✅ Processed 10M+ records/day  
✅ Real-time analytics dashboard  
✅ 95% data quality score

[📂 **Explore Repository** →](https://github.com/mrnamazbek/Big-Data-Final)

</td>
<td width="50%" valign="top">

### 🎵 Music Station
<i>AI-powered recommendation engine</i>

**ML Pipeline:**
```
Data Lake → Feature Engineering
     ↓            ↓
  FastAPI ← ML Model (Collaborative)
```

**Tech Stack:**  
![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![ML](https://img.shields.io/badge/-ML-FF6F00?style=flat-square)

**Impact:**  
✅ 85% recommendation accuracy  
✅ <100ms API response time  
✅ 1M+ songs indexed

[📂 **Explore Repository** →](https://github.com/mrnamazbek/Music-Station)

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏭 EPAM Data Engineering
<i>Professional ETL ecosystem</i>

**Pipeline Flow:**
```
Sources → Kafka → Airflow → DWH
   ↓        ↓        ↓       ↓
Extract  Stream  Orchestrate Load
```

**Tech Stack:**  
![Kafka](https://img.shields.io/badge/-Kafka-000?style=flat-square&logo=apachekafka)
![Airflow](https://img.shields.io/badge/-Airflow-017CEE?style=flat-square&logo=apacheairflow&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

**Impact:**  
✅ 24/7 automated workflows  
✅ 99.9% uptime SLA  
✅ Multi-source integration

[📂 **Explore Repository** →](https://github.com/mrnamazbek/EPAM-Data-Engineering)

</td>
<td width="50%" valign="top">

### 📚 KBTU ML Assignments
<i>Graduate-level ML portfolio</i>

**Topics Covered:**
```
- Linear/Logistic Regression
- K-Nearest Neighbors (KNN), Random Forest & SVM
- Feature Engineering, Custom Transformers
```

**Tech Stack:**  
![Scikit-Learn](https://img.shields.io/badge/-Scikit_Learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![Jupyter](https://img.shields.io/badge/-Jupyter-F37626?style=flat-square&logo=jupyter&logoColor=white)
![Pandas](https://img.shields.io/badge/-Pandas-150458?style=flat-square&logo=pandas&logoColor=white)

**Impact:**  
✅ 6 complete assignments  
✅ Full code + documentation  
✅ Real-world datasets

[📂 **Explore Repository** →](https://github.com/mrnamazbek/KBTU_ML_Assignments)

</td>
</tr>
</table>
</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

## 📊 GitHub Analytics Dashboard

<div align="center">

<div align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=mrnamazbek&theme=tokyonight&hide_border=true" />
</div>

<table>
<tr>
<td width="50%" align="center">

<br/><br/>

**📉 Contribution Activity**

<img src="https://github-readme-activity-graph.vercel.app/graph?username=mrnamazbek&theme=react-dark&hide_border=true&area=true&bg_color=0D1117&color=00F7F7&line=00F7F7&point=FFFFFF" width="95%"/>

</div>

<br/>

<!-- Glowing Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<br/>

## 🤝 Connect With Me

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/namazbek-bekzhanov/)
[![Email](https://img.shields.io/badge/Gmail-Contact_Me-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:namazbekzhan@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/namazbekzhan)

<br/>

### 💭 Quote of the Moment
<img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=tokyonight" />

<br/>

**Profile Views** 👁️  
<img src="https://komarev.com/ghpvc/?username=mrnamazbek&label=Visitors&color=0e75b6&style=flat" alt="Profile views" />

</div>

<sub>Engineer of my own destiny. Built different. Chasing greatness.</sub>


<br/><br/>

<!-- Wave Footer -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,3,5,6&height=120&section=footer" />
