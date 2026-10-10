-- Idempotent public-content seed. Review before applying to a production project.
-- Re-running updates matching IDs; it does not delete added rows or touch private contacts.
begin;

insert into public.site_profiles (id,name,short_name,role,location,bio,headline,availability,career_started_at,resume_url,email,secondary_email,work_email,links,philosophy,signature_url,avatar_url,published)
values ('main','Namazbek Bekzhanov','Namazbek','Data Engineer & Backend Developer','Almaty, Kazakhstan','I craft high-performance pipelines, optimize SQL engines, and build reliable digital infrastructure.','Building resilient data systems.','Open to Work','2023-02-01','/assets/Namazbek_s_Resume_INT.pdf','namazbekzhan@gmail.com','bekzhanovnnn@gmail.com','na_bekzhanov@kbtu.kz','{"github":"https://github.com/mrnamazbek","linkedin":"https://linkedin.com/in/namazbek-bekzhanov","telegram":"https://t.me/tech_digest_kz"}'::jsonb,'I treat data systems like banking systems: correctness first, fast second. That mindset turns pipelines into durable products — observable, testable, and trusted.','/assets/NBA_signature.png','/assets/avatar-ascii.svg',true)
on conflict (id) do update set name = excluded.name, short_name = excluded.short_name, role = excluded.role, location = excluded.location, bio = excluded.bio, headline = excluded.headline, availability = excluded.availability, career_started_at = excluded.career_started_at, resume_url = excluded.resume_url, email = excluded.email, secondary_email = excluded.secondary_email, work_email = excluded.work_email, links = excluded.links, philosophy = excluded.philosophy, signature_url = excluded.signature_url, avatar_url = excluded.avatar_url, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('nbk','Middle Data Engineer','The National Bank of Kazakhstan (Digital Development Center)','May 2024 — Present','Almaty, Kazakhstan','Full-time',array['Built a Vertica MPP warehouse for financial reporting and cut analytical query latency.','Built ETL/ELT pipelines in Greenplum from six state systems (ESSP, GKB, ENPF, EIVK, KASE, NPK).','Orchestrate with Airflow and transform with dbt, with data quality checks and monitoring.','Designed a Data Lake on S3/MinIO with Apache Iceberg and Trino for cold data.','Enforce row-level security with Apache Ranger; observability with Zabbix and Grafana.']::text[],array['Python','SQL','Airflow','dbt','Vertica','Trino','S3']::text[],true,0,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('kbtu-ta','Teaching Assistant (Cloud Computing & DevOps)','Kazakh-British Technical University','Sep 2025 — Present','Bostandıq District · On-site','Part-time',array['Ran labs + supported lectures on cloud application development.','Guided deployments on GCP (App Engine, Cloud Functions, Cloud SQL).','Reviewed assignments and helped students debug containerized workloads.']::text[],array['GCP','Docker','Python','Linux']::text[],true,1,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('epam','Data Software Engineering Trainee','EPAM Systems','Sep 2024 — Present','Remote','Internship',array['Strengthened advanced SQL and data modeling through real-world exercises.','Studied modern DWH/lake patterns and ETL/ELT workflows.','Built analytics/visualization deliverables with cloud-aware practices.']::text[],array['Python','SQL','Git','GitLab']::text[],true,2,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('sdu-research','Research Assistant (Computer Vision / ML)','SDU University, Kazakhstan','Jun 2024 — Dec 2024','Almaty, Kazakhstan · Remote','Part-time',array['Prepared datasets (LabelImg) and trained YOLO detection models.','Improved model quality via structured experiments and metric-driven evaluation.','Optimized training/inference workflows with PyTorch + Scikit-learn.']::text[],array['Python','PyTorch','CV/ML']::text[],false,3,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('bcc','Core Banking Systems (Colvir CBS) Support Engineer','Bank CenterCredit','Oct 2023 — Apr 2024','Almaty, Kazakhstan · On-site','Full-time',array['Supported Colvir CBS on Oracle, including EOD batch processing and accounting closings.','Resolved incidents with Oracle SQL and PL/SQL; wrote data correction and validation scripts.','Built automated extraction pipelines and SQL views for live Power BI dashboards.','Worked in Jira, ServiceDesk and Confluence under enterprise SLAs.']::text[],array['Oracle','PL/SQL','Power BI','Jira','Confluence']::text[],false,4,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.experiences (id,role,organization,period,location,kind,highlights,technologies,current,position,published)
values ('alma','Junior Database Engineer','Alma Telecommunications Kazakhstan','Feb 2023 — Sep 2023','Almaty, Kazakhstan · On-site','Full-time',array['Built C# (.NET) background services for billing files and payment notifications.','Optimized PL/SQL procedures and triggers using execution plan analysis.','Administered Oracle databases: security, integrity checks, index maintenance.']::text[],array['Oracle','C#','.NET','Linux']::text[],false,5,true)
on conflict (id) do update set role = excluded.role, organization = excluded.organization, period = excluded.period, location = excluded.location, kind = excluded.kind, highlights = excluded.highlights, technologies = excluded.technologies, current = excluded.current, position = excluded.position, published = excluded.published;

insert into public.education (id,degree,institution,period,description,note,status,position,published)
values ('kbtu-masters','Master''s degree — Computer Science and Data Analytics','Kazakh-British Technical University','Sep 2025 — Present','Focused on Big Data, Machine Learning, AI, Data Engineering & Analytics, and Software Engineering. Building deeper expertise in Python, ML libraries, and intelligent systems.',null,'current',0,true)
on conflict (id) do update set degree = excluded.degree, institution = excluded.institution, period = excluded.period, description = excluded.description, note = excluded.note, status = excluded.status, position = excluded.position, published = excluded.published;

insert into public.education (id,degree,institution,period,description,note,status,position,published)
values ('sdu-bachelors','Bachelor''s degree — Information Systems','Suleyman Demirel University','Sep 2021 — Jun 2025','Focused on Software Engineering, Databases, and Computer Networks. Explored Big Data, Blockchain, Web Development, and Linux Administration; built strong foundations in algorithms, probability & statistics, and data engineering concepts.','Off the clock: football fan — teamwork, strategy, and fast decisions under pressure.','completed',1,true)
on conflict (id) do update set degree = excluded.degree, institution = excluded.institution, period = excluded.period, description = excluded.description, note = excluded.note, status = excluded.status, position = excluded.position, published = excluded.published;

insert into public.education (id,degree,institution,period,description,note,status,position,published)
values ('tum-ambition','Master''s Degree — Data Engineering','Technical University of Munich (Germany)','Future Goal','Planning to pursue advanced expertise in Data Engineering, large-scale distributed systems, and modern data architectures at one of Europe''s top technical universities.',null,'planned',2,true)
on conflict (id) do update set degree = excluded.degree, institution = excluded.institution, period = excluded.period, description = excluded.description, note = excluded.note, status = excluded.status, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('1','Google AI Fundamentals','Google','Apr 2026','ZWLGE1YNC4TM',array[]::text[],0,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('2','Certificate of completion: Claude 101','Anthropic','Mar 2026','stz5kjzvohzj',array[]::text[],1,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('3','Google Cloud Big Data and Machine Learning Fundamentals','Google','Sep 2024','LM5GBC4KKBLT',array[]::text[],2,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('4','Software Engineer','HackerRank','Sep 2025','bd05e4f8a435',array['Software Engineering','REST APIs']::text[],3,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('5','Data Engineering','Freedom Holding Corp.','Oct 2024',null,array['Python','Apache Airflow']::text[],4,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('6','SQL (Advanced) Certificate','HackerRank',null,'cba2aa129267',array['SQL','MySQL']::text[],5,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('7','SQL for Data Science','University of California, Davis',null,'GLYVDBVYEPH7',array['SQLite','Databases']::text[],6,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('8','Python for Data Science','IBM','Feb 2024',null,array['Python','Docker']::text[],7,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('9','Red Hat Certified System Administrator (RHCSA II)','Red Hat','Nov 2023',null,array['Docker','Linux Server']::text[],8,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('10','Red Hat Certified System Administrator (RHCSA)','Red Hat','Oct 2023',null,array['RHEL','Linux SysAdmin']::text[],9,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.certifications (id,title,issuer,issued,credential_id,skills,position,published)
values ('11','Docker Essentials: A Developer Introduction','IBM','Feb 2024',null,array['Docker Swarm','Containerization']::text[],10,true)
on conflict (id) do update set title = excluded.title, issuer = excluded.issuer, issued = excluded.issued, credential_id = excluded.credential_id, skills = excluded.skills, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('1','Machine Learning & AI',array['Scikit-learn','TensorFlow','PyTorch','Keras','NumPy','Pandas']::text[],0,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('2','Big Data',array['Spark','Hadoop','Airflow','Kafka']::text[],1,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('3','Cold Data',array['Iceberg','S3','Trino','Debezium']::text[],2,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('4','Languages',array['Python','Go','Java','SQL','Bash']::text[],3,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('5','Databases',array['Postgres','Oracle','MySQL','MSSQL','Vertica','Sybase','Replica']::text[],4,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('6','DevOps',array['Docker','Git','Linux','FastAPI']::text[],5,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.skill_groups (id,category,technologies,position,published)
values ('7','Environment',array['PyCharm','DataGrip','DataSpell','DBeaver','Antigravity']::text[],6,true)
on conflict (id) do update set category = excluded.category, technologies = excluded.technologies, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1335370849','developer-lab','developer-lab','A privacy-friendly browser toolkit for everyday engineering work','https://github.com/mrnamazbek/developer-lab',null,'JavaScript',array[]::text[],0,0,true,'2026-10-09T16:12:48Z','github','2026-10-10',0,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1060206127','mrnamazbek','mrnamazbek','Self-updating GitHub profile & personal website — Data Engineer @ National Bank of Kazakhstan. Built with vanilla JS, Python pipelines & CI/CD.','https://github.com/mrnamazbek/mrnamazbek','https://mrnamazbek.github.io/mrnamazbek/','JavaScript',array[]::text[],1,0,false,'2026-10-05T11:44:08Z','github','2026-10-10',1,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1375536811','ultimate-data-engineering-interview-ru','ultimate-data-engineering-interview-ru','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/ultimate-data-engineering-interview-ru',null,'Python',array[]::text[],0,0,false,'2026-10-05T06:47:17Z','github','2026-10-10',2,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1105723004','kbtu-ml-assignments','KBTU_ML_Assignments','KBTU ML assignments involve practical applications of scikit-learn, TensorFlow, and PyTorch to deepen understanding of ML algorithms and real-world scenarios.','https://github.com/mrnamazbek/KBTU_ML_Assignments',null,'Jupyter Notebook',array[]::text[],0,0,false,'2026-09-24T04:32:09Z','github','2026-10-10',3,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1156100082','valentine-day','valentine_day','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/valentine_day',null,'HTML',array[]::text[],0,0,false,'2026-09-22T19:07:05Z','github','2026-10-10',4,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1348272697','untverse','untverse','Gamified UNT Informatics learning platform built with Next.js, FastAPI and PostgreSQL.','https://github.com/mrnamazbek/untverse',null,'Python',array[]::text[],0,0,true,'2026-09-17T10:50:41Z','github','2026-10-10',5,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1246895178','ddc-nbk-website','ddc-nbk-website','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/ddc-nbk-website','https://ddcnbsite.vercel.app','TypeScript',array[]::text[],0,0,true,'2026-09-17T10:46:46Z','github','2026-10-10',6,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1191619321','egov-site','egov_site','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/egov_site',null,'CSS',array[]::text[],0,0,false,'2026-07-29T10:54:11Z','github','2026-10-10',7,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1307278531','football-quiz-trainer','football-quiz-trainer','Offline football trivia trainer: World Cup 2026, Champions League, and Europe''s top-5 leagues. 96 clubs with generated crest badges.','https://github.com/mrnamazbek/football-quiz-trainer','https://mrnamazbek.github.io/football-quiz-trainer/','CSS',array['champions-league','football','github-pages','quiz','trivia','world-cup-2026']::text[],0,0,false,'2026-07-22T11:24:00Z','github','2026-10-10',8,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1182602209','content-machine','content_machine','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/content_machine',null,'Python',array[]::text[],0,0,false,'2026-05-15T11:33:48Z','github','2026-10-10',9,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('579311805','final-project','Final_project','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/Final_project',null,'HTML',array[]::text[],1,0,false,'2026-05-12T11:36:53Z','github','2026-10-10',10,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1234091295','gmail-drive-ai-suite','gmail-drive-ai-suite','🤖 AI-powered Gmail & Google Drive automation suite using Google Apps Script + Gemini AI. Auto-categorize emails, track job applications, detect deadlines, clean inbox, and get daily AI briefings.','https://github.com/mrnamazbek/gmail-drive-ai-suite',null,'JavaScript',array[]::text[],0,0,true,'2026-05-09T18:40:52Z','github','2026-10-10',11,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1173371055','ultimate-data-engineering-projects','ultimate_data_engineering_projects','modern data engineering projects ','https://github.com/mrnamazbek/ultimate_data_engineering_projects',null,'Python',array[]::text[],0,0,true,'2026-03-07T23:20:57Z','github','2026-10-10',12,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1160829024','skills-introduction-to-github','skills-introduction-to-github','My clone repository','https://github.com/mrnamazbek/skills-introduction-to-github',null,null,array[]::text[],0,0,false,'2026-02-18T12:24:06Z','github','2026-10-10',13,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1099256986','kbtu-advanced-software-paradigms','KBTU_advanced_software_paradigms','This project repository hosts coursework for "Advanced Software Paradigms," emphasizing clean coding practices, modular architecture, and structured documentation in Python. It includes two primary tasks: the initial system implementation focused on data collection and analytics (task 1) and an advanced event-driven architecture (task 2), featuring','https://github.com/mrnamazbek/KBTU_advanced_software_paradigms',null,'Python',array[]::text[],0,0,false,'2025-12-28T16:16:58Z','github','2026-10-10',14,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('1059290846','datamining-sis1-project','DataMining_SIS1_Project','University Data Mining project (SIS1). Includes dataset preprocessing, EDA, feature engineering, and baseline models. Group project.','https://github.com/mrnamazbek/DataMining_SIS1_Project',null,'Jupyter Notebook',array[]::text[],0,0,false,'2025-12-13T09:25:37Z','github','2026-10-10',15,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('902561424','steam-game-scraping','Steam-Game-Scraping','This project involves scraping data from Steam, cleaning and analyzing it, and creating insightful visualizations. It is divided into three phases: Scraping, Analyzing, and Visualization. Below is a structured guide for understanding and working on this project.','https://github.com/mrnamazbek/Steam-Game-Scraping',null,'Jupyter Notebook',array[]::text[],0,0,true,'2024-12-12T20:20:58Z','github','2026-10-10',16,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('897163599','twitter-airflow-data-engineering','twitter-airflow-data-engineering','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/twitter-airflow-data-engineering',null,null,array[]::text[],0,0,false,'2024-12-02T06:29:45Z','github','2026-10-10',17,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('863139510','epam-data-engineering','EPAM-Data-Engineering','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/EPAM-Data-Engineering',null,null,array[]::text[],0,0,false,'2024-09-26T07:08:00Z','github','2026-10-10',18,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('800789523','transfermarkt-datasets','Transfermarkt-datasets','Explore the source code and documentation on GitHub.','https://github.com/mrnamazbek/Transfermarkt-datasets',null,'Python',array[]::text[],0,0,false,'2024-09-16T20:44:35Z','github','2026-10-10',19,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('573049288','brute-force','Brute-Force','Dont give up','https://github.com/mrnamazbek/Brute-Force',null,null,array[]::text[],0,0,false,'2024-07-20T15:46:13Z','github','2026-10-10',20,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('793270970','blockchain-project','Blockchain_Project','This repository contains a series of Solidity smart contracts developed for the VK social media platform, a decentralized application running on the Ethereum blockchain. The contracts manage various aspects of the platform, including user profiles, posts, interactions like liking and unliking posts, and more.','https://github.com/mrnamazbek/Blockchain_Project',null,'Solidity',array[]::text[],0,0,false,'2024-04-28T22:13:16Z','github','2026-10-10',21,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('640598909','backend-project','Backend_Project','The BookStore App is a digital scrapbooking tool that allows users to create and share virtual memory books with friends and family. This innovative platform aims to provide a fun and interactive way for users to preserve their memories in a personalized and engaging way.','https://github.com/mrnamazbek/Backend_Project',null,null,array[]::text[],0,0,false,'2023-05-14T16:11:16Z','github','2026-10-10',22,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.projects (id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at,position,published)
values ('577012094','mrthrahser','mrthrahser','Config files for my GitHub profile.','https://github.com/mrnamazbek/mrthrahser','https://github.com/mrthrahser',null,array['config','github-config']::text[],0,0,false,'2022-12-11T17:49:11Z','github','2026-10-10',23,true)
on conflict (id) do update set slug = excluded.slug, name = excluded.name, description = excluded.description, url = excluded.url, homepage = excluded.homepage, language = excluded.language, tags = excluded.tags, stars = excluded.stars, forks = excluded.forks, featured = excluded.featured, updated_at = excluded.updated_at, source = excluded.source, captured_at = excluded.captured_at, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('kleppmann-ddia','Designing Data-Intensive Applications','Martin Kleppmann','https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg','9781449373320','A practical guide to designing scalable, reliable, maintainable systems.','A deep, practical tour of replication, partitioning, transactions, streams, and the real trade-offs behind modern data systems. It helps you reason about correctness, latency, throughput, and failure modes — the exact things that make pipelines trustworthy in production.',array['architecture','consistency','replication']::text[],'reading','Cover — Designing Data-Intensive Applications',0,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('reis-fundamentals-de','Fundamentals of Data Engineering','Joe Reis & Matt Housley','https://covers.openlibrary.org/b/isbn/9781098108304-L.jpg','9781098108304','A modern overview of the data engineering lifecycle.','Frames data engineering as a product discipline: quality, governance, observability, cost, and ownership. Strong for turning ad-hoc pipelines into reliable data products that teams can trust.',array['lifecycle','governance','quality']::text[],'to-read','Cover — Fundamentals of Data Engineering',1,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('martin-clean-code','Clean Code','Robert C. Martin','https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg','9780132350884','A handbook of agile software craftsmanship.','Even in data engineering, unreadable code creates outages. This book pushes naming, structure, testing discipline, and refactoring habits that keep pipelines and services maintainable.',array['craftsmanship','refactoring','testing']::text[],'completed','Cover — Clean Code',2,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('martin-clean-coder','The Clean Coder','Robert C. Martin','https://covers.openlibrary.org/b/isbn/9780137081073-L.jpg','9780137081073','Professionalism, habits, and decision-making under engineering pressure.','A guide to professional engineering behavior: saying “no” when needed, communication, estimation, and building trust through consistent execution. Great for growing from "good coder" to dependable engineer.',array['career','habits','professionalism']::text[],'to-read','Cover — The Clean Coder',3,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('kimball-dw-toolkit','The Data Warehouse Toolkit','Ralph Kimball','https://covers.openlibrary.org/b/isbn/9781118530801-L.jpg','9781118530801','The definitive guide to dimensional modeling.','Explains facts, dimensions, slowly changing dimensions, and patterns that make analytics models understandable and scalable. Still extremely relevant for BI layers and data marts.',array['modeling','analytics','dimensional']::text[],'to-read','Cover — The Data Warehouse Toolkit',4,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.books (id,title,author,cover_url,isbn,summary,description,tags,status,alt,position,published)
values ('shapira-kafka','Kafka: The Definitive Guide','Gwen Shapira','https://covers.openlibrary.org/b/isbn/9781491936160-L.jpg','9781491936160','Real-time data and stream processing at scale.','Covers Kafka architecture, delivery guarantees, and operational practices. Useful for building CDC pipelines, streaming ingestion, and event-driven integrations without fragile coupling.',array['streaming','events','kafka']::text[],'to-read','Cover — Kafka: The Definitive Guide',5,true)
on conflict (id) do update set title = excluded.title, author = excluded.author, cover_url = excluded.cover_url, isbn = excluded.isbn, summary = excluded.summary, description = excluded.description, tags = excluded.tags, status = excluded.status, alt = excluded.alt, position = excluded.position, published = excluded.published;

insert into public.posts (slug,title,description,date,tags,canonical_url,image,reading_time,body,position,published)
values ('postgres-query-optimization','Practical Query Optimization in Postgres: Indexes, Partitioning, and Plan Introspection','Learn how to speed up Postgres queries with B-tree indexes, table partitioning, and EXPLAIN ANALYZE. Step-by-step with real Python code.','2026-02-23',array['postgresql','data-engineering','sql','query-optimization','python']::text[],'https://mrnamazbek.github.io/blog/postgres-query-optimization',null,'9 min','<!-- slug: postgres-query-optimization -->

> **Hero image alt text:** "A terminal showing a PostgreSQL EXPLAIN ANALYZE plan with highlighted index scans"
> **Unsplash image query:** `postgresql database terminal dark`

---

## TL;DR

Slow Postgres queries kill your pipeline SLA. Learn three levers — the right index type, range partitioning, and `EXPLAIN ANALYZE` — to cut query time by 10–100×. All examples run locally in Docker with no cloud account needed.

**Audience:** strong-junior → middle Data Engineer

---

## Why This Matters

Postgres is the most-deployed relational database for analytics workloads in 2026 ([KDnuggets survey](https://www.kdnuggets.com/top-data-engineering-trends-2026)). You will deal with slow queries. Understanding *why* they are slow — and *how* the query planner thinks — saves hours of firefighting in production.

---

## Learning Goals

- Understand how Postgres chooses between `Seq Scan` and `Index Scan`.
- Add B-tree and partial indexes and verify their effect with `EXPLAIN ANALYZE`.
- Use table partitioning to enable partition pruning on large time-series tables.

---

## Background Theory

### How the query planner works

The Postgres planner is a cost-based optimizer. It estimates row counts and I/O cost for each possible plan. The plan with the lowest estimated cost wins.

```
SQL query
   │
   ▼
Parser  ──► Rewriter  ──► Planner/Optimizer  ──► Executor
                                │
                    Statistics (pg_statistics)
                    + catalog (pg_class, pg_index)
```

Two key concepts:

| Term | Meaning |
|------|---------|
| `Seq Scan` | Read every row in the table. Fast for small tables; slow for large ones. |
| `Index Scan` | Use a B-tree index to find rows fast. Good when few rows match. |
| `Bitmap Heap Scan` | Combine index lookups, then fetch pages. Used for medium selectivity. |

### B-tree indexes

A B-tree index is the default. It is a balanced tree sorted by key. Lookups are O(log n). Good for `=`, `<`, `>`, `BETWEEN`, and `ORDER BY`.

```
         [50]
        /    \
    [25]      [75]
   /    \    /    \
[10] [30] [60] [90]
```

### Table partitioning

Range partitioning splits a large table into child tables by a key (usually a date). When you query `WHERE created_at >= ''2026-01-01''`, Postgres skips child tables that cannot match. This is called **partition pruning**.

```mermaid
graph TD
  A[orders] --> B[orders_2024]
  A --> C[orders_2025]
  A --> D[orders_2026]
  style D fill:#f9f,stroke:#333
  note["Query WHERE year=2026\n→ only scans orders_2026"]
```

---

## Practical Example

### What the code does

We create a `sales` table with 500,000 rows. We run the same query before and after adding an index. We then partition the table and compare query plans.

### Folder structure

```
blog/demos/post-a-postgres/
├── app.py               # main demo script
├── sample_data.py       # generates sample CSV
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── tests/
    ├── test_unit.py     # unit tests (pytest)
    └── test_smoke.py    # smoke test (requests / curl)
```

### Sample data generator

```python
# blog/demos/post-a-postgres/sample_data.py
"""Generate a deterministic sales CSV for the demo."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 500_000
OUTPUT = Path("sales.csv")


def generate():
    start = date(2024, 1, 1)
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["id", "customer_id", "product_id", "amount", "created_at"])
        for i in range(1, ROWS + 1):
            day_offset = random.randint(0, 729)   # 2 years of data
            writer.writerow([
                i,
                random.randint(1, 10_000),
                random.randint(1, 500),
                round(random.uniform(1.0, 9999.0), 2),
                start + timedelta(days=day_offset),
            ])
    print(f"Generated {ROWS} rows → {OUTPUT}")


if __name__ == "__main__":
    generate()
```

### Main demo script

```python
# blog/demos/post-a-postgres/app.py
"""
Postgres query-optimization demo.

Steps:
  1. Create the sales table.
  2. Load sample data from CSV.
  3. Run a slow query and show its plan (Seq Scan).
  4. Add a B-tree index and show the improved plan (Index Scan).
  5. Create a partitioned version and show partition pruning.
"""
import os
import time

import psycopg2
from psycopg2.extras import execute_values

DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://demo:demo@localhost:5432/demodb",
)


def connect():
    return psycopg2.connect(DSN)


def setup_table(cur):
    """Drop and recreate the plain sales table."""
    cur.execute("DROP TABLE IF EXISTS sales CASCADE;")
    cur.execute("""
        CREATE TABLE sales (
            id           BIGINT PRIMARY KEY,
            customer_id  INT    NOT NULL,
            product_id   INT    NOT NULL,
            amount       NUMERIC(12, 2) NOT NULL,
            created_at   DATE   NOT NULL
        );
    """)


def load_csv(cur, path: str = "sales.csv"):
    """Bulk-load from CSV using COPY for maximum speed."""
    with open(path) as fh:
        next(fh)  # skip header
        cur.copy_expert(
            "COPY sales (id, customer_id, product_id, amount, created_at) FROM STDIN CSV",
            fh,
        )


def run_query(cur, label: str):
    """Run a sample query and return wall time + plan."""
    query = """
        SELECT customer_id, SUM(amount) AS total
        FROM sales
        WHERE created_at BETWEEN ''2026-01-01'' AND ''2026-01-31''
        GROUP BY customer_id
        ORDER BY total DESC
        LIMIT 10;
    """
    # Capture the EXPLAIN ANALYZE output.
    cur.execute(f"EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {query}")
    plan_lines = [row[0] for row in cur.fetchall()]

    t0 = time.perf_counter()
    cur.execute(query)
    cur.fetchall()
    elapsed = time.perf_counter() - t0

    print(f"\n=== {label} ===")
    print("\n".join(plan_lines[:8]))  # print first 8 lines of the plan
    print(f"Wall time: {elapsed * 1000:.1f} ms")
    return elapsed


def add_index(cur):
    """Add a B-tree index on the date column."""
    cur.execute("CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at);")


def setup_partitioned_table(cur):
    """Create a range-partitioned version for 2024–2026."""
    cur.execute("DROP TABLE IF EXISTS sales_p CASCADE;")
    cur.execute("""
        CREATE TABLE sales_p (
            id           BIGINT,
            customer_id  INT    NOT NULL,
            product_id   INT    NOT NULL,
            amount       NUMERIC(12, 2) NOT NULL,
            created_at   DATE   NOT NULL
        ) PARTITION BY RANGE (created_at);
    """)
    # Create one partition per year.
    for year in (2024, 2025, 2026):
        cur.execute(f"""
            CREATE TABLE sales_p_{year}
            PARTITION OF sales_p
            FOR VALUES FROM (''{year}-01-01'') TO (''{year + 1}-01-01'');
        """)


def copy_to_partitioned(cur):
    """Copy data from the plain table into the partitioned one."""
    cur.execute("INSERT INTO sales_p SELECT * FROM sales;")


def run_query_partitioned(cur, label: str):
    """Same query but on the partitioned table."""
    query = """
        SELECT customer_id, SUM(amount) AS total
        FROM sales_p
        WHERE created_at BETWEEN ''2026-01-01'' AND ''2026-01-31''
        GROUP BY customer_id
        ORDER BY total DESC
        LIMIT 10;
    """
    cur.execute(f"EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) {query}")
    plan_lines = [row[0] for row in cur.fetchall()]

    t0 = time.perf_counter()
    cur.execute(query)
    cur.fetchall()
    elapsed = time.perf_counter() - t0

    print(f"\n=== {label} ===")
    print("\n".join(plan_lines[:8]))
    print(f"Wall time: {elapsed * 1000:.1f} ms")
    return elapsed


def main():
    import sample_data
    sample_data.generate()

    conn = connect()
    conn.autocommit = True
    cur = conn.cursor()

    # Step 1 – plain table, no index
    setup_table(cur)
    load_csv(cur)
    t_seq = run_query(cur, "No index (Seq Scan)")

    # Step 2 – add index
    add_index(cur)
    t_idx = run_query(cur, "With B-tree index")

    # Step 3 – partitioned table
    setup_partitioned_table(cur)
    copy_to_partitioned(cur)
    t_part = run_query_partitioned(cur, "Partitioned table (pruning)")

    print(f"\nSpeedup (index vs seq): {t_seq / t_idx:.1f}×")
    print(f"Speedup (partition vs seq): {t_seq / t_part:.1f}×")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
```

### requirements.txt

```
psycopg2-binary==2.9.9
pytest==8.3.3
requests==2.32.3
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: demo
      POSTGRES_PASSWORD: demo
      POSTGRES_DB: demodb
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U demo"]
      interval: 5s
      retries: 10

  demo:
    build: .
    environment:
      DATABASE_URL: postgresql://demo:demo@postgres:5432/demodb
    depends_on:
      postgres:
        condition: service_healthy
```

### Unit test

```python
# blog/demos/post-a-postgres/tests/test_unit.py
"""Unit tests for the Postgres query-optimization demo."""
import csv
import os
from pathlib import Path

import pytest

# Make sure sample_data is importable from the parent directory.
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

import sample_data


def test_generate_creates_file(tmp_path, monkeypatch):
    """generate() must create a CSV file with a header and ROWS rows."""
    # Redirect output to a temp directory.
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(sample_data, "OUTPUT", tmp_path / "sales.csv")
    monkeypatch.setattr(sample_data, "ROWS", 100)  # keep test fast

    sample_data.generate()

    out = tmp_path / "sales.csv"
    assert out.exists()
    with out.open() as fh:
        rows = list(csv.reader(fh))
    # Header + 100 data rows
    assert len(rows) == 101
    assert rows[0] == ["id", "customer_id", "product_id", "amount", "created_at"]


def test_row_values_in_range(tmp_path, monkeypatch):
    """All generated rows must have valid numeric values."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(sample_data, "OUTPUT", tmp_path / "sales.csv")
    monkeypatch.setattr(sample_data, "ROWS", 50)

    sample_data.generate()

    with (tmp_path / "sales.csv").open() as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            assert 1 <= int(row["customer_id"]) <= 10_000
            assert 1.0 <= float(row["amount"]) <= 9999.0
```

### Smoke test

```python
# blog/demos/post-a-postgres/tests/test_smoke.py
"""Integration smoke test: verify Postgres is reachable and the demo ran."""
import os
import psycopg2
import pytest

DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://demo:demo@localhost:5432/demodb",
)


@pytest.mark.integration
def test_postgres_is_reachable():
    """Postgres must accept a connection and respond to a simple query."""
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    assert cur.fetchone() == (1,)
    cur.close()
    conn.close()


@pytest.mark.integration
def test_sales_table_has_rows():
    """The sales table must contain at least one row after the demo runs."""
    conn = psycopg2.connect(DSN)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM sales;")
    count = cur.fetchone()[0]
    assert count > 0, "sales table is empty — did the demo run?"
    cur.close()
    conn.close()
```

---

## How to Run Locally

### With Docker (recommended)

```bash
cd blog/demos/post-a-postgres

# Build and start Postgres + demo container
docker compose up --build

# In another terminal, run unit tests (no DB needed)
docker compose run --rm demo pytest tests/test_unit.py -v

# Run smoke tests (DB must be running)
docker compose run --rm demo pytest tests/test_smoke.py -v -m integration
```

### With venv (alternative)

```bash
cd blog/demos/post-a-postgres

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# You need a running Postgres (e.g. via Docker)
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=demo -e POSTGRES_PASSWORD=demo -e POSTGRES_DB=demodb \
  postgres:16-alpine

export DATABASE_URL=postgresql://demo:demo@localhost:5432/demodb
python app.py

pytest tests/test_unit.py -v
pytest tests/test_smoke.py -v -m integration
```

---

## Complexity & Performance Notes

| Approach | Write cost | Read cost | Maintenance |
|----------|-----------|-----------|-------------|
| No index | O(1) | O(n) full scan | None |
| B-tree index | O(log n) extra | O(log n) | `VACUUM`, `ANALYZE` |
| Partitioning | Slightly higher | O(n / partitions) per scan | Partition management |

**When to use each:**
- B-tree index: selective queries (`<1 % of rows`). Avoid on low-cardinality columns (e.g., boolean flags).
- Partitioning: tables > 10 GB or when you regularly drop old data (just `DROP` the partition).
- Partial index: when you only query a subset (e.g., `WHERE status = ''active''`).

---

## Real-World Tips

**Ops:** Run `EXPLAIN (ANALYZE, BUFFERS)` — the `BUFFERS` option shows cache hits. Many "slow" queries are actually hitting disk, not CPU.

**Observability:** Enable `pg_stat_statements` extension. It records cumulative query stats and lets you find the top 10 slowest queries in production.

**Security:** Never connect to Postgres as the superuser from application code. Create a dedicated role with `SELECT`/`INSERT`/`UPDATE` on specific tables only.

---

## SEO Features

**Meta description (≤160 chars):**
> Speed up Postgres queries with indexes, partitioning, and EXPLAIN ANALYZE. Step-by-step Python demo with Docker, pytest, and real data.

**SEO keywords:**
1. postgresql query optimization
2. postgres index performance
3. explain analyze postgres
4. table partitioning postgresql
5. b-tree index postgres
6. data engineering postgres tutorial
7. postgres slow query fix
8. partition pruning postgresql

**Hashtags:** `#PostgreSQL` `#DataEngineering` `#Python`

---

## Cross-Post Snippet

### Medium (80–120 words)

> **Postgres is faster than you think — if you set it up right.**
>
> In this post I show three techniques that cut query time by 10–100×: B-tree indexes, range partitioning, and reading EXPLAIN ANALYZE output. All code runs in Docker with no cloud account needed.
>
> I include a working Python demo with 500K rows of sample data, pytest unit tests, and a smoke test that verifies the DB is up.
>
> *Originally published at [https://mrnamazbek.github.io/blog/postgres-query-optimization](https://mrnamazbek.github.io/blog/postgres-query-optimization).*

### Dev.to (40–80 words)

> Three levers that make Postgres 10–100× faster: B-tree indexes, range partitioning, and `EXPLAIN ANALYZE`. Full Python demo with Docker + pytest included. No cloud required.
>
> Tags: `#postgres` `#dataengineering` `#python` `#sql`

---

## Final Checklist

1. **Unit test pass:** `pytest tests/test_unit.py -v` → all green.
2. **Smoke test pass:** `pytest tests/test_smoke.py -v -m integration` → both tests pass.
3. **Linting:** `ruff check app.py sample_data.py tests/` → no errors.
4. **Screenshot:** Run `docker compose up` and capture terminal output showing `Speedup (index vs seq): X×`.
5. **CI snippet:** See `.github/workflows/blog-ci.yml` in this repository.

---

## Convert to Other Formats

**LinkedIn post (≤3 sentences):**
"Postgres slow queries are painful. I wrote a step-by-step guide covering indexes, partitioning, and EXPLAIN ANALYZE — with a full Docker + Python demo. Link in comments."

**Twitter/X thread (60 s):**
"🧵 Make Postgres 100× faster — a thread: 1/ Seq Scan = reading every row. Fix it with a B-tree index. 2/ Add partitioning to let Postgres skip whole year partitions. 3/ Read EXPLAIN (ANALYZE, BUFFERS) to confirm the index is used. Full code → [link]"

**Mini video script (30–60 s):**
"Open terminal. Run docker compose up. Watch 500K rows load. Now run the slow query — 800 ms. Add one line: CREATE INDEX. Run again — 12 ms. That''s a 66× speedup. Add partitioning — 4 ms. EXPLAIN ANALYZE shows exactly why. Full code in the blog post."

---

## Sources

1. PostgreSQL Documentation — Query Planning: <https://www.postgresql.org/docs/16/query-plan.html>
2. Joe Reis — "Where Data Engineering Is Heading in 2026": <https://www.joereis.net/p/where-data-engineering-is-heading>
3. Cybertec — "Partition Pruning in PostgreSQL": <https://www.cybertec-postgresql.com/en/partition-pruning-postgresql/>
4. KDnuggets — "Top Data Engineering Trends 2026": <https://www.kdnuggets.com/top-data-engineering-trends-2026>',0,true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, date = excluded.date, tags = excluded.tags, canonical_url = excluded.canonical_url, image = excluded.image, reading_time = excluded.reading_time, body = excluded.body, position = excluded.position, published = excluded.published;

insert into public.posts (slug,title,description,date,tags,canonical_url,image,reading_time,body,position,published)
values ('etl-ai-feature-pipelines','Designing ETL for AI: Building Robust Feature Pipelines and Feature Stores','Learn how to build reliable ML feature pipelines in Python: ingestion, transformation, storage, and serving — with Docker and pytest.','2026-02-23',array['feature-store','feature-pipeline','mlops','data-engineering','python','etl']::text[],'https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines',null,'10 min','<!-- slug: etl-ai-feature-pipelines -->

> **Hero image alt text:** "A data flow diagram showing raw data moving through a feature pipeline into a feature store"
> **Unsplash image query:** `machine learning pipeline data flow abstract`

---

## TL;DR

AI models are only as good as their features. Learn how to design a feature pipeline: ingest raw events, compute features, store them with versioning, and serve them at low latency. Fully working Python + FastAPI demo, runs in Docker, no paid APIs needed.

**Audience:** strong-junior → middle Data Engineer

---

## Why This Matters

In 2026, the boundary between data engineering and ML engineering is blurring. Joe Reis calls this the "AI-native pipeline era" ([source](https://www.joereis.net/p/where-data-engineering-is-heading)). Feature pipelines are the bridge. A bad feature pipeline means stale data, training-serving skew, and broken model predictions. Getting this right is now a core data engineering skill.

---

## Learning Goals

- Understand training-serving skew and why it kills ML models in production.
- Build a feature pipeline that computes, stores, and versions features.
- Serve features through a lightweight API and write tests to verify freshness.

---

## Background Theory

### What is a feature pipeline?

A **feature** is a number that the ML model uses as input (e.g., "average purchase amount in the last 30 days"). A **feature pipeline** transforms raw data into features and stores them so that:

- The training job can read *historical* feature values.
- The serving layer can read the *latest* feature values in milliseconds.

### Training-serving skew

Training-serving skew happens when the feature computed at training time is different from the feature computed at serving time. Common causes:

- Different code paths for batch (training) vs. real-time (serving).
- Aggregation window mismatch (30 days vs. 28 days).
- Timezone bugs.

The fix: **one single feature computation function** used in both paths.

### Architecture

```
Raw events (CSV / Kafka)
        │
        ▼
  Feature Pipeline
  ┌─────────────────────────────┐
  │  1. Ingest                  │
  │  2. Validate (schema check) │
  │  3. Compute features        │
  │  4. Write to Feature Store  │
  └─────────────────────────────┘
        │
        ▼
  Feature Store (SQLite / Postgres / Redis)
        │
   ┌────┴────┐
   ▼         ▼
Training   Serving API
  Job      (FastAPI)
```

### Feature store options

| Option | Latency | Best for |
|--------|---------|---------|
| SQLite (demo) | ~1 ms | Local dev, demos |
| PostgreSQL | ~2–5 ms | Small-to-medium production |
| Redis | <1 ms | High-throughput online serving |
| Feast / Tecton | varies | Enterprise, multi-team |

---

## Practical Example

### What the code does

We simulate an e-commerce event stream (CSV). The pipeline computes three features per customer: `total_orders`, `avg_order_value`, and `days_since_last_order`. Features are stored in SQLite. A FastAPI app serves them. Tests verify freshness.

### Folder structure

```
blog/demos/post-b-feature-pipeline/
├── pipeline.py          # feature computation + storage
├── api.py               # FastAPI serving layer
├── sample_data.py       # generates sample events CSV
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── tests/
    ├── test_unit.py
    └── test_smoke.py
```

### Sample data generator

```python
# blog/demos/post-b-feature-pipeline/sample_data.py
"""Generate deterministic customer order events CSV."""
import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 10_000
OUTPUT = Path("events.csv")


def generate():
    start = date(2025, 1, 1)
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["event_id", "customer_id", "order_value", "event_date"])
        for i in range(1, ROWS + 1):
            writer.writerow([
                i,
                random.randint(1, 200),                       # 200 customers
                round(random.uniform(10.0, 500.0), 2),
                start + timedelta(days=random.randint(0, 364)),
            ])
    print(f"Generated {ROWS} events → {OUTPUT}")


if __name__ == "__main__":
    generate()
```

### Feature pipeline

```python
# blog/demos/post-b-feature-pipeline/pipeline.py
"""
Feature pipeline: ingest events → compute features → write to SQLite store.

Features computed per customer_id:
  - total_orders:          count of all orders
  - avg_order_value:       mean order value (rounded to 2 dp)
  - days_since_last_order: days between latest order and reference_date
"""
import csv
import sqlite3
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List

DB_PATH = Path("feature_store.db")
REFERENCE_DATE = date(2026, 1, 1)   # fixed for reproducibility


# ---------------------------------------------------------------------------
# Core feature computation — shared by pipeline AND serving API.
# ---------------------------------------------------------------------------

def compute_features(events: List[dict], reference_date: date = REFERENCE_DATE) -> Dict[int, dict]:
    """
    Compute per-customer features from a list of raw event dicts.

    Args:
        events: list of dicts with keys customer_id, order_value, event_date.
        reference_date: the "today" anchor for days_since_last_order.

    Returns:
        dict mapping customer_id → feature dict.
    """
    buckets: Dict[int, list] = defaultdict(list)
    for ev in events:
        cid = int(ev["customer_id"])
        buckets[cid].append({
            "order_value": float(ev["order_value"]),
            "event_date": (
                ev["event_date"] if isinstance(ev["event_date"], date)
                else datetime.strptime(str(ev["event_date"]), "%Y-%m-%d").date()
            ),
        })

    features = {}
    for cid, orders in buckets.items():
        values = [o["order_value"] for o in orders]
        last_date = max(o["event_date"] for o in orders)
        features[cid] = {
            "total_orders": len(orders),
            "avg_order_value": round(sum(values) / len(values), 2),
            "days_since_last_order": (reference_date - last_date).days,
        }
    return features


# ---------------------------------------------------------------------------
# Storage helpers
# ---------------------------------------------------------------------------

def init_db(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Create the feature store table if it does not exist."""
    conn = sqlite3.connect(str(db_path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS customer_features (
            customer_id          INTEGER PRIMARY KEY,
            total_orders         INTEGER,
            avg_order_value      REAL,
            days_since_last_order INTEGER,
            updated_at           TEXT
        );
    """)
    conn.commit()
    return conn


def write_features(conn: sqlite3.Connection, features: Dict[int, dict]):
    """Upsert computed features into the store."""
    now = datetime.utcnow().isoformat()
    rows = [
        (cid, f["total_orders"], f["avg_order_value"], f["days_since_last_order"], now)
        for cid, f in features.items()
    ]
    conn.executemany("""
        INSERT INTO customer_features
            (customer_id, total_orders, avg_order_value, days_since_last_order, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(customer_id) DO UPDATE SET
            total_orders          = excluded.total_orders,
            avg_order_value       = excluded.avg_order_value,
            days_since_last_order = excluded.days_since_last_order,
            updated_at            = excluded.updated_at;
    """, rows)
    conn.commit()


def read_events_from_csv(path: str = "events.csv") -> List[dict]:
    """Load raw events from CSV into a list of dicts."""
    with open(path) as fh:
        return list(csv.DictReader(fh))


# ---------------------------------------------------------------------------
# Pipeline entry point
# ---------------------------------------------------------------------------

def run_pipeline(csv_path: str = "events.csv", db_path: Path = DB_PATH):
    """Full pipeline: load → compute → store."""
    print(f"Loading events from {csv_path} …")
    events = read_events_from_csv(csv_path)
    print(f"  Loaded {len(events)} events.")

    print("Computing features …")
    features = compute_features(events)
    print(f"  Computed features for {len(features)} customers.")

    print(f"Writing to feature store at {db_path} …")
    conn = init_db(db_path)
    write_features(conn, features)
    conn.close()
    print("  Done.")


if __name__ == "__main__":
    import sample_data
    sample_data.generate()
    run_pipeline()
```

### Serving API

```python
# blog/demos/post-b-feature-pipeline/api.py
"""
FastAPI feature-serving layer.

Endpoints:
  GET /features/{customer_id}   → latest features for one customer
  GET /healthz                  → liveness probe
"""
import sqlite3
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_PATH = Path("feature_store.db")

app = FastAPI(title="Feature Store API", version="1.0.0")


class CustomerFeatures(BaseModel):
    customer_id: int
    total_orders: int
    avg_order_value: float
    days_since_last_order: int
    updated_at: str


def get_conn():
    """Open a read-only SQLite connection."""
    return sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)


@app.get("/healthz")
def healthz():
    """Liveness probe — always returns 200 if the server is up."""
    return {"status": "ok", "ts": datetime.utcnow().isoformat()}


@app.get("/features/{customer_id}", response_model=CustomerFeatures)
def get_features(customer_id: int):
    """Return the latest feature vector for a given customer."""
    try:
        conn = get_conn()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Feature store unavailable") from exc

    cur = conn.cursor()
    cur.execute(
        "SELECT customer_id, total_orders, avg_order_value, days_since_last_order, updated_at "
        "FROM customer_features WHERE customer_id = ?",
        (customer_id,),
    )
    row = cur.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")

    return CustomerFeatures(
        customer_id=row[0],
        total_orders=row[1],
        avg_order_value=row[2],
        days_since_last_order=row[3],
        updated_at=row[4],
    )
```

### requirements.txt

```
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.10.3
pytest==8.3.3
requests==2.32.3
httpx==0.28.1
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run pipeline first, then start the API server.
CMD ["sh", "-c", "python pipeline.py && uvicorn api:app --host 0.0.0.0 --port 8000"]
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  feature-api:
    build: .
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8000/healthz || exit 1"]
      interval: 5s
      retries: 15
```

### Unit test

```python
# blog/demos/post-b-feature-pipeline/tests/test_unit.py
"""Unit tests for the feature pipeline (no DB or network needed)."""
import sys
from datetime import date
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline import compute_features


EVENTS = [
    {"customer_id": "1", "order_value": "100.00", "event_date": "2025-06-01"},
    {"customer_id": "1", "order_value": "200.00", "event_date": "2025-12-01"},
    {"customer_id": "2", "order_value": "50.00",  "event_date": "2025-03-15"},
]

REF_DATE = date(2026, 1, 1)


def test_total_orders():
    """Customer 1 has 2 orders, customer 2 has 1."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["total_orders"] == 2
    assert features[2]["total_orders"] == 1


def test_avg_order_value():
    """Customer 1 average must be 150.00."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["avg_order_value"] == 150.00


def test_days_since_last_order():
    """Customer 1 last order 2025-12-01 → 31 days before 2026-01-01."""
    features = compute_features(EVENTS, REF_DATE)
    assert features[1]["days_since_last_order"] == 31


def test_training_serving_parity():
    """The same function must produce identical results when called twice."""
    f1 = compute_features(EVENTS, REF_DATE)
    f2 = compute_features(EVENTS, REF_DATE)
    assert f1 == f2
```

### Smoke test

```python
# blog/demos/post-b-feature-pipeline/tests/test_smoke.py
"""Integration smoke test: verify the API is running and returns features."""
import os
import requests
import pytest

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


@pytest.mark.integration
def test_healthz():
    """GET /healthz must return 200 with status=ok."""
    resp = requests.get(f"{BASE_URL}/healthz", timeout=5)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.integration
def test_get_features_known_customer():
    """GET /features/1 must return a valid feature vector."""
    resp = requests.get(f"{BASE_URL}/features/1", timeout=5)
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == 1
    assert data["total_orders"] > 0
    assert 0 < data["avg_order_value"] < 10_000


@pytest.mark.integration
def test_get_features_unknown_customer():
    """GET /features/99999 must return 404."""
    resp = requests.get(f"{BASE_URL}/features/99999", timeout=5)
    assert resp.status_code == 404
```

---

## How to Run Locally

### With Docker (recommended)

```bash
cd blog/demos/post-b-feature-pipeline

# Build and start the feature API (pipeline runs on container start)
docker compose up --build

# Unit tests (no network needed)
docker compose run --rm feature-api pytest tests/test_unit.py -v

# Smoke tests (API must be running)
docker compose run --rm -e API_BASE_URL=http://feature-api:8000 \
  feature-api pytest tests/test_smoke.py -v -m integration
```

### With venv (alternative)

```bash
cd blog/demos/post-b-feature-pipeline

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python pipeline.py        # generates events.csv and feature_store.db
uvicorn api:app --reload  # start serving

pytest tests/test_unit.py -v
pytest tests/test_smoke.py -v -m integration
```

---

## Deep Dive: Feature Store Internals

A production feature store has three planes:

| Plane | What it stores | Latency requirement |
|-------|---------------|---------------------|
| **Offline store** | Historical feature values for training | Minutes acceptable |
| **Online store** | Latest feature value per entity | <10 ms required |
| **Registry** | Feature definitions, metadata, lineage | Not on critical path |

Our SQLite demo acts as both online and offline store. For production, use PostgreSQL as the offline store and Redis as the online store. The key insight: **compute once, store twice** — write to both stores from a single pipeline run.

---

## Real-World Tips

**Ops:** Track feature freshness. If `days_since_last_order` is 999 for many customers, your pipeline has not run recently. Add a Grafana alert.

**Observability:** Log the number of customers updated per pipeline run. A sudden drop means upstream data is missing.

**Security:** The SQLite file contains PII (customer IDs + purchase data). Encrypt at rest in production. Use environment variables for DB credentials — never hardcode them.

---

## SEO Features

**Meta description (≤160 chars):**
> Build a Python feature pipeline from scratch: ingest, compute, store, and serve ML features with FastAPI. Docker demo, pytest included. No cloud required.

**SEO keywords:**
1. feature pipeline python
2. feature store tutorial
3. etl for machine learning
4. mlops feature engineering
5. training serving skew
6. fastapi feature store
7. data engineering AI pipeline
8. feature computation python

**Hashtags:** `#MLOps` `#DataEngineering` `#Python`

---

## Cross-Post Snippet

### Medium (80–120 words)

> **Feature pipelines are the bridge between raw data and AI models.**
>
> In this post I build a complete feature pipeline in Python: raw event ingestion, feature computation, SQLite feature store, and a FastAPI serving layer. The same function computes features in both training and serving, which eliminates training-serving skew.
>
> Everything runs in Docker. No cloud account needed. Tests included (pytest unit + smoke).
>
> *Originally published at [https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines](https://mrnamazbek.github.io/blog/etl-ai-feature-pipelines).*

### Dev.to (40–80 words)

> Build a complete ML feature pipeline in Python: ingest events, compute features, store them in SQLite, serve via FastAPI. Same function for training and serving = zero training-serving skew. Docker + pytest included.
>
> Tags: `#mlops` `#dataengineering` `#python` `#machinelearning`

---

## Final Checklist

1. **Unit test pass:** `pytest tests/test_unit.py -v` → 4 tests green.
2. **Smoke test pass:** `pytest tests/test_smoke.py -v -m integration` → 3 tests green.
3. **Linting:** `ruff check pipeline.py api.py sample_data.py tests/` → no errors.
4. **Screenshot:** `curl http://localhost:8000/features/1` returns a JSON feature vector.
5. **CI snippet:** See `.github/workflows/blog-ci.yml` in this repository.

---

## Convert to Other Formats

**LinkedIn post:**
"ML models fail in production because of bad features — not bad algorithms. I wrote a guide to building a feature pipeline: compute once, store twice, serve fast. Python + FastAPI + Docker. Link in comments."

**Twitter/X thread:**
"🧵 Feature pipelines explained: 1/ Raw events → compute features (same code for training + serving). 2/ Store in SQLite (dev) or Redis (prod). 3/ Serve via FastAPI in <10 ms. 4/ Training-serving skew = fixed. Full code → [link]"

**Mini video script (30–60 s):**
"Watch this: raw CSV goes in. 10,000 order events. Pipeline computes three features per customer. Writes to a feature store. FastAPI serves them in under 2 ms. Same function runs in training. That''s it — no skew, ever. Full code in the blog post."

---

## Sources

1. Joe Reis — "Where Data Engineering Is Heading in 2026": <https://www.joereis.net/p/where-data-engineering-is-heading>
2. Databricks — "Data + AI Roundup February 2026": <https://www.databricks.com/blog/data-ai-roundup-february-2026>
3. Feast documentation — "What is a Feature Store?": <https://docs.feast.dev/getting-started/concepts/feature-store>
4. OpenSourceForU — "Data Engineering & Python in the AI Era": <https://opensourceforU.com/data-engineering-python-ai-era-2025/>',1,true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, date = excluded.date, tags = excluded.tags, canonical_url = excluded.canonical_url, image = excluded.image, reading_time = excluded.reading_time, body = excluded.body, position = excluded.position, published = excluded.published;

insert into public.posts (slug,title,description,date,tags,canonical_url,image,reading_time,body,position,published)
values ('python-performance-data-pipelines','Python Performance for Data Pipelines: Profiling, Vectorization, and Safe Concurrency','Profile Python pipelines, replace slow loops with NumPy vectorization, and safely parallelize I/O with ThreadPoolExecutor. Step-by-step with Docker.','2026-02-23',array['python','performance','data-engineering','vectorization','concurrency','profiling']::text[],'https://mrnamazbek.github.io/blog/python-performance-data-pipelines',null,'11 min','<!-- slug: python-performance-data-pipelines -->

> **Hero image alt text:** "A Python profiler flame graph showing hot spots in a data pipeline"
> **Unsplash image query:** `python code performance speed terminal`

---

## TL;DR

Pure-Python loops are the #1 performance killer in data pipelines. Learn how to find hot spots with `cProfile`, replace loops with NumPy vectorization, and safely parallelize I/O-bound work with `ThreadPoolExecutor`. All demos run locally with no external services needed.

**Audience:** strong-junior → middle Data Engineer

---

## Why This Matters

Python 3.13 removed the GIL in free-threaded mode, changing how engineers think about concurrency ([Python 3.13 release notes](https://docs.python.org/3.13/whatsnew/3.13.html)). Meanwhile, KDnuggets reports Polars and NumPy-backed pipelines running 20–50× faster than equivalent pandas code ([KDnuggets 2026](https://www.kdnuggets.com/top-data-engineering-trends-2026)). Understanding *why* your pipeline is slow — and which tool fixes it — is now a core skill.

---

## Learning Goals

- Use `cProfile` and `snakeviz` to find the bottleneck in a pipeline.
- Replace a Python `for` loop with NumPy vectorization and measure the speedup.
- Use `ThreadPoolExecutor` safely for I/O-bound parallel tasks.

---

## Background Theory

### Where Python is slow

Python is fast enough for most orchestration code. It is slow for tight numeric loops because each Python operation has overhead: reference counting, type checking, and the GIL (in standard CPython 3.12 and below).

```
Python loop over 1M rows
  ┌───────────────────────────┐
  │ for row in data:          │  ← Python bytecode overhead per row
  │   result = row * 2.5      │  ← boxing/unboxing float
  └───────────────────────────┘
Wall time: ~200 ms

NumPy vectorized (same math)
  ┌───────────────────────────┐
  │ result = data * 2.5       │  ← one C call, operates on whole array
  └───────────────────────────┘
Wall time: ~2 ms  →  100× faster
```

### Profiling mental model

```
cProfile → find the slowest functions (wall time, call count)
    │
    ▼
snakeviz → visualize as a flame graph or icicle chart
    │
    ▼
Fix only the hot spot (80/20 rule: 20% of code = 80% of time)
```

### Concurrency vs. parallelism

| Term | Meaning | Python tool |
|------|---------|------------|
| Concurrency | Tasks overlap in time (not necessarily simultaneously) | `asyncio`, `ThreadPoolExecutor` |
| Parallelism | Tasks run at the same CPU moment | `ProcessPoolExecutor`, `multiprocessing` |

For I/O-bound work (network, disk, DB), threads are faster than processes because most time is spent waiting, not computing. Use `ThreadPoolExecutor`.

For CPU-bound work (heavy math), use `ProcessPoolExecutor` or NumPy/Polars (which release the GIL internally).

### The GIL in CPython 3.12 and 3.13

In CPython ≤3.12, the GIL prevents two Python threads from running Python bytecode simultaneously. This makes `ThreadPoolExecutor` good *only* for I/O-bound tasks.

In CPython 3.13+ with free-threaded mode (`python3.13t`), the GIL is optional. True CPU parallelism in threads is now possible — but most libraries are not yet fully tested in this mode. Use with caution in 2026.

---

## Practical Example

### What the code does

We have a pipeline that reads 1 million rows from a CSV, applies a numeric transformation, and writes results. We profile it, replace the Python loop with NumPy vectorization, and then parallelize the I/O-bound file loading step.

### Folder structure

```
blog/demos/post-c-python-perf/
├── pipeline.py          # slow and fast pipeline implementations
├── generate_data.py     # generates sample CSV
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── tests/
    ├── test_unit.py
    └── test_smoke.py
```

### Data generator

```python
# blog/demos/post-c-python-perf/generate_data.py
"""Generate a large deterministic CSV for the performance demo."""
import csv
import random
from pathlib import Path

SEED = 42
random.seed(SEED)

ROWS = 1_000_000
OUTPUT = Path("transactions.csv")


def generate():
    with OUTPUT.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["transaction_id", "amount", "fee_rate"])
        for i in range(1, ROWS + 1):
            writer.writerow([
                i,
                round(random.uniform(1.0, 10_000.0), 2),
                round(random.uniform(0.001, 0.05), 4),
            ])
    print(f"Generated {ROWS} rows → {OUTPUT}")


if __name__ == "__main__":
    generate()
```

### Main pipeline

```python
# blog/demos/post-c-python-perf/pipeline.py
"""
Three implementations of the same transformation for benchmarking.

Transformation: fee = amount * fee_rate

  1. slow_pipeline:   pure Python loop (baseline)
  2. fast_pipeline:   NumPy vectorized (recommended)
  3. parallel_loader: concurrent file loading with ThreadPoolExecutor
"""
import cProfile
import io
import pstats
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# 1. Slow: pure Python loop
# ---------------------------------------------------------------------------

def slow_pipeline(df: pd.DataFrame) -> list:
    """Compute fee for each row using a Python for-loop."""
    results = []
    for _, row in df.iterrows():
        # This is slow: df.iterrows() + Python float math on each row.
        fee = row["amount"] * row["fee_rate"]
        results.append(fee)
    return results


# ---------------------------------------------------------------------------
# 2. Fast: NumPy vectorization
# ---------------------------------------------------------------------------

def fast_pipeline(df: pd.DataFrame) -> np.ndarray:
    """Compute fee for all rows in one NumPy operation."""
    # .values gives a NumPy array; multiplication is a single C call.
    return df["amount"].values * df["fee_rate"].values


# ---------------------------------------------------------------------------
# 3. Parallel I/O with ThreadPoolExecutor
# ---------------------------------------------------------------------------

def _load_chunk(path: str) -> pd.DataFrame:
    """Load one CSV file (or chunk). Simulates I/O-bound work."""
    return pd.read_csv(path)


def parallel_loader(paths: list[str], max_workers: int = 4) -> list[pd.DataFrame]:
    """
    Load multiple files in parallel using threads.

    Threads are safe here because pd.read_csv releases the GIL during I/O.
    """
    results = [None] * len(paths)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_load_chunk, p): i for i, p in enumerate(paths)}
        for future in as_completed(futures):
            idx = futures[future]
            results[idx] = future.result()
    return results


# ---------------------------------------------------------------------------
# Profiling helper
# ---------------------------------------------------------------------------

def profile_function(func, *args, top_n: int = 10) -> str:
    """
    Run func(*args) under cProfile and return a formatted stats string.

    Args:
        func:  callable to profile.
        args:  positional arguments for func.
        top_n: number of top functions to show (sorted by cumulative time).

    Returns:
        Formatted stats string.
    """
    profiler = cProfile.Profile()
    profiler.enable()
    func(*args)
    profiler.disable()

    stream = io.StringIO()
    stats = pstats.Stats(profiler, stream=stream)
    stats.sort_stats("cumulative")
    stats.print_stats(top_n)
    return stream.getvalue()


# ---------------------------------------------------------------------------
# Benchmark runner
# ---------------------------------------------------------------------------

def benchmark(df: pd.DataFrame):
    """Compare slow vs. fast pipeline and print results."""
    # Warm up: load the data once.
    print(f"Rows: {len(df):,}")

    # --- Slow ---
    t0 = time.perf_counter()
    slow_result = slow_pipeline(df)
    t_slow = time.perf_counter() - t0
    print(f"\nSlow pipeline (Python loop):  {t_slow * 1000:.1f} ms")

    # --- Fast ---
    t0 = time.perf_counter()
    fast_result = fast_pipeline(df)
    t_fast = time.perf_counter() - t0
    print(f"Fast pipeline (NumPy):        {t_fast * 1000:.1f} ms")

    speedup = t_slow / t_fast
    print(f"Speedup: {speedup:.1f}×")

    # Verify results match (within floating-point tolerance).
    assert np.allclose(slow_result, fast_result, rtol=1e-5), "Results differ!"
    print("Results match ✓")


def main():
    import generate_data
    generate_data.generate()

    print("Loading data …")
    df = pd.read_csv("transactions.csv")

    print("\n=== Profiling slow pipeline ===")
    # Profile with first 100K rows to keep output readable.
    profile_output = profile_function(slow_pipeline, df.head(100_000))
    print(profile_output[:2000])   # print first 2000 chars

    print("\n=== Benchmark (1M rows) ===")
    benchmark(df)

    print("\n=== Parallel loader (simulated multi-file) ===")
    # Split CSV into 4 small files for the parallel demo.
    chunk_size = len(df) // 4
    paths = []
    for i in range(4):
        chunk_path = f"chunk_{i}.csv"
        df.iloc[i * chunk_size:(i + 1) * chunk_size].to_csv(chunk_path, index=False)
        paths.append(chunk_path)

    t0 = time.perf_counter()
    frames = parallel_loader(paths)
    t_parallel = time.perf_counter() - t0
    total_rows = sum(len(f) for f in frames)
    print(f"Loaded {total_rows:,} rows in {t_parallel * 1000:.1f} ms (4 threads)")


if __name__ == "__main__":
    main()
```

### requirements.txt

```
numpy==2.2.0
pandas==2.2.3
pytest==8.3.3
requests==2.32.3
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "pipeline.py"]
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  perf-demo:
    build: .
    volumes:
      - .:/app
```

### Unit tests

```python
# blog/demos/post-c-python-perf/tests/test_unit.py
"""Unit tests for the performance pipeline (no files or network needed)."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from pipeline import slow_pipeline, fast_pipeline, parallel_loader


def make_df(n: int = 1000) -> pd.DataFrame:
    """Create a small deterministic DataFrame for testing."""
    rng = np.random.default_rng(42)
    return pd.DataFrame({
        "amount": rng.uniform(1.0, 100.0, n),
        "fee_rate": rng.uniform(0.001, 0.05, n),
    })


def test_slow_and_fast_give_same_results():
    """slow_pipeline and fast_pipeline must produce identical results."""
    df = make_df(1000)
    slow = slow_pipeline(df)
    fast = fast_pipeline(df)
    assert np.allclose(slow, fast, rtol=1e-5)


def test_fast_pipeline_returns_numpy_array():
    """fast_pipeline must return a NumPy array."""
    df = make_df(100)
    result = fast_pipeline(df)
    assert isinstance(result, np.ndarray)


def test_fast_pipeline_length_matches_input():
    """Output length must equal input length."""
    df = make_df(500)
    result = fast_pipeline(df)
    assert len(result) == 500


def test_fast_pipeline_no_negative_fees():
    """All fees must be positive (amount > 0, fee_rate > 0)."""
    df = make_df(200)
    result = fast_pipeline(df)
    assert (result > 0).all()


def test_parallel_loader_total_rows(tmp_path):
    """parallel_loader must return all rows from multiple files."""
    df = make_df(200)
    # Write two chunks.
    p1 = str(tmp_path / "a.csv")
    p2 = str(tmp_path / "b.csv")
    df.iloc[:100].to_csv(p1, index=False)
    df.iloc[100:].to_csv(p2, index=False)

    frames = parallel_loader([p1, p2], max_workers=2)
    total = sum(len(f) for f in frames)
    assert total == 200
```

### Smoke test

```python
# blog/demos/post-c-python-perf/tests/test_smoke.py
"""Smoke test: run the full pipeline and verify outputs are correct."""
import subprocess
import sys
from pathlib import Path

import pytest

DEMO_DIR = Path(__file__).parent.parent


@pytest.mark.integration
def test_pipeline_runs_without_error():
    """pipeline.py must exit with code 0."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, f"Pipeline failed:\n{result.stderr}"


@pytest.mark.integration
def test_pipeline_reports_speedup():
    """pipeline.py stdout must mention ''Speedup''."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert "Speedup" in result.stdout, "Expected ''Speedup'' in output"


@pytest.mark.integration
def test_pipeline_results_match():
    """pipeline.py stdout must confirm results match."""
    result = subprocess.run(
        [sys.executable, "pipeline.py"],
        cwd=DEMO_DIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert "Results match" in result.stdout
```

---

## How to Run Locally

### With Docker (recommended)

```bash
cd blog/demos/post-c-python-perf

# Build and run the benchmark
docker compose up --build

# Unit tests (no files needed)
docker compose run --rm perf-demo pytest tests/test_unit.py -v

# Smoke tests (pipeline must complete)
docker compose run --rm perf-demo pytest tests/test_smoke.py -v -m integration
```

### With venv (alternative)

```bash
cd blog/demos/post-c-python-perf

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python pipeline.py

pytest tests/test_unit.py -v
pytest tests/test_smoke.py -v -m integration
```

---

## Deep Dive: Why NumPy Is Fast

NumPy stores data in a contiguous block of memory (a C array). When you write `array * 2.5`, NumPy calls a single C function that loops over the raw memory — no Python overhead per element.

```
Python list:  [PyFloat, PyFloat, PyFloat, …]   ← each element is a Python object
               ↑ 28 bytes each, scattered in heap

NumPy array:  [2.5, 3.1, 1.8, …]              ← raw C doubles, contiguous
               ↑ 8 bytes each, one memory block
```

SIMD (Single Instruction Multiple Data) instructions on modern CPUs can operate on 4–8 floats simultaneously. NumPy uses them automatically through its underlying BLAS/LAPACK or SVML libraries. Your Python loop cannot use SIMD because each iteration depends on Python''s object model.

**Polars** goes one step further: it uses Apache Arrow memory format and a Rust query engine that applies multi-threaded SIMD operations. On large DataFrames, Polars is typically 5–10× faster than Pandas + NumPy.

---

## Real-World Tips

**Ops:** Profile in production using `py-spy` (a sampling profiler that attaches to a running Python process without restarting it). No code change needed.

**Observability:** Record pipeline wall time as a metric (e.g., with Prometheus `Gauge`). Alert if it grows more than 20% week-over-week.

**Security:** `ThreadPoolExecutor` shares memory between threads. If your transformation mutates a shared list or DataFrame, you will have race conditions. Always create a new local copy inside the worker function, or use immutable inputs.

---

## SEO Features

**Meta description (≤160 chars):**
> Speed up Python data pipelines with cProfile, NumPy vectorization, and ThreadPoolExecutor. Step-by-step demo with Docker and pytest. No cloud needed.

**SEO keywords:**
1. python pipeline performance
2. numpy vectorization tutorial
3. cprofile python data pipeline
4. threadpoolexecutor python
5. python data engineering optimization
6. pandas performance improvement
7. python gil concurrency
8. profiling python code

**Hashtags:** `#Python` `#DataEngineering` `#Performance`

---

## Cross-Post Snippet

### Medium (80–120 words)

> **Python loops are slow. Here''s how to fix them.**
>
> This post shows a three-step workflow: profile with `cProfile` to find the bottleneck, replace the slow loop with NumPy vectorization for a 100× speedup, then parallelize I/O-bound file loading with `ThreadPoolExecutor`.
>
> All code runs on a 1-million-row CSV, fully in Docker. Pytest unit and smoke tests included.
>
> I also cover the GIL, Python 3.13 free-threaded mode, and when to use processes vs. threads.
>
> *Originally published at [https://mrnamazbek.github.io/blog/python-performance-data-pipelines](https://mrnamazbek.github.io/blog/python-performance-data-pipelines).*

### Dev.to (40–80 words)

> Python loops on 1M rows: 200 ms. NumPy: 2 ms. That''s 100×. This post shows how to profile with cProfile, fix with NumPy vectorization, and parallelize I/O with ThreadPoolExecutor. Covers GIL, Python 3.13 free-threaded mode, and when threads vs. processes matter.
>
> Tags: `#python` `#dataengineering` `#performance` `#numpy`

---

## Final Checklist

1. **Unit test pass:** `pytest tests/test_unit.py -v` → 5 tests green.
2. **Smoke test pass:** `pytest tests/test_smoke.py -v -m integration` → 3 tests green.
3. **Linting:** `ruff check pipeline.py generate_data.py tests/` → no errors.
4. **Screenshot:** Terminal output showing `Speedup: X×` and `Results match ✓`.
5. **CI snippet:** See `.github/workflows/blog-ci.yml` in this repository.

---

## Convert to Other Formats

**LinkedIn post:**
"I replaced a Python for-loop with one NumPy line and got a 100× speedup. It sounds simple. But most data engineers I work with haven''t profiled their own pipelines yet. Here''s how: cProfile → snakeviz → fix the hot spot. Full guide in comments."

**Twitter/X thread:**
"🧵 Python is not slow. Your code is slow. 1/ Profile first: cProfile finds the hot spot in 2 minutes. 2/ Replace the loop: NumPy does 1M-row math in 2 ms vs. 200 ms. 3/ Parallelize I/O: ThreadPoolExecutor loads 4 files at once. 4/ Result: 100× faster, same output. Full code → [link]"

**Mini video script (30–60 s):**
"Start the timer. Python loop, 1 million rows: 200 milliseconds. Now replace five lines with one NumPy expression. Run again: 2 milliseconds. 100× faster. No new libraries, no cloud. Just using NumPy the right way. Full profile, benchmark, and tests in the blog post."

---

## Sources

1. Python 3.13 release notes — Free-threaded mode: <https://docs.python.org/3.13/whatsnew/3.13.html> *(background)*
2. KDnuggets — "Top Data Engineering Trends 2026": <https://www.kdnuggets.com/top-data-engineering-trends-2026>
3. NumPy documentation — "Why NumPy is fast": <https://numpy.org/doc/stable/user/whatisnumpy.html>
4. OpenSourceForU — "Data Engineering & Python in the AI Era": <https://opensourceforU.com/data-engineering-python-ai-era-2025/>',2,true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, date = excluded.date, tags = excluded.tags, canonical_url = excluded.canonical_url, image = excluded.image, reading_time = excluded.reading_time, body = excluded.body, position = excluded.position, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('telegram','{"channel":"tech_digest_kz","updated":null,"posts":[]}'::jsonb,null,true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('rankings','[{"rank":1,"name":"Oracle","model":"Relational , Multi-model Relational DBMS Document store Graph DBMS RDF store Spatial DBMS Vector DBMS","score_current":1119.79,"score_prev_month":1122.27,"score_prev_year":1212.77,"delta_mom":-2.48,"delta_yoy":-92.98,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-oracle-original colored"},{"rank":2,"name":"MySQL","model":"Relational , Multi-model Relational DBMS Document store Spatial DBMS","score_current":837.96,"score_prev_month":844.81,"score_prev_year":879.66,"delta_mom":-6.85,"delta_yoy":-41.7,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-mysql-plain colored"},{"rank":3,"name":"Microsoft SQL Server","model":"Relational , Multi-model Relational DBMS Document store Graph DBMS Spatial DBMS","score_current":694.47,"score_prev_month":698.69,"score_prev_year":715.05,"delta_mom":-4.22,"delta_yoy":-20.58,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-microsoftsqlserver-plain colored"},{"rank":4,"name":"PostgreSQL","model":"Relational , Multi-model Relational DBMS Document store Graph DBMS Spatial DBMS Vector DBMS","score_current":688.75,"score_prev_month":683.25,"score_prev_year":643.19,"delta_mom":5.5,"delta_yoy":45.56,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-postgresql-plain colored"},{"rank":5,"name":"MongoDB","model":"Document , Multi-model Document store Key-value store Spatial DBMS Search engine Time Series DBMS Vector DBMS","score_current":374.64,"score_prev_month":381.3,"score_prev_year":368.01,"delta_mom":-6.66,"delta_yoy":6.63,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-mongodb-plain colored"},{"rank":6,"name":"Snowflake","model":"Relational","score_current":221.3,"score_prev_month":211.61,"score_prev_year":198.65,"delta_mom":9.69,"delta_yoy":22.65,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":""},{"rank":7,"name":"Databricks","model":"Multi-model Document store Relational DBMS","score_current":171.24,"score_prev_month":168.34,"score_prev_year":128.8,"delta_mom":2.9,"delta_yoy":42.44,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":""},{"rank":8,"name":"Redis","model":"Key-value , Multi-model Key-value store Document store Graph DBMS Spatial DBMS Search engine Time Series DBMS Vector DBMS","score_current":156.09,"score_prev_month":158.06,"score_prev_year":142.33,"delta_mom":-1.97,"delta_yoy":13.76,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":"devicon-redis-plain colored"},{"rank":9,"name":"IBM Db2","model":"Relational , Multi-model Relational DBMS Document store RDF store Spatial DBMS","score_current":106.29,"score_prev_month":110.57,"score_prev_year":122.37,"delta_mom":-4.28,"delta_yoy":-16.08,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":""},{"rank":10,"name":"Apache Cassandra","model":"Wide column , Multi-model Wide column store Vector DBMS","score_current":98.86,"score_prev_month":93.96,"score_prev_year":105.16,"delta_mom":4.9,"delta_yoy":-6.3,"as_of":"Oct 2026","source":"https://db-engines.com/en/ranking","icon":""}]'::jsonb,'Oct 2026',true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('monthlyFeature','{"id":"2026-09-ai-automation","month":"2026-09","title":"AI automation: Monthly AI Feature","trend_keyword":"AI automation","description":"Automatically generated feature from current trend data.","why_now":"Trend data indicates high current interest, making it a useful candidate for quick product experiments.","mobile_review_notes":"Built with responsive layout and mobile-safe controls.","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-09-17T10:54:16.860724+00:00"},"widget":{"type":"impact_estimator","heading":"AI automation: Capacity Estimator","description":"Estimate monthly engineering time unlocked by automation.","config":{"input_label":"Automation coverage","min":0,"max":100,"step":5,"default":50,"baseline_hours":52,"efficiency_factor":0.6}}}'::jsonb,'2026-09',true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('featureHistory','[{"id":"2026-02-ai-automation","month":"2026-02","title":"News-to-Action Digest: Turn Trending “новости” Into Team-Ready Updates","trend_keyword":"AI automation","description":"Build a lightweight internal digest that converts high-volume news queries into actionable, non-political operational updates for product and engineering teams. The feature pulls headlines from approved sources, clusters duplicates, summarizes in plain English, and routes items i","why_now":"In KZ during 2026-02, “новости” is trending, signaling elevated demand for timely information. Teams often waste time scanning multiple feeds and still miss operationally relevant items. A structured digest with deduplication, summarization, and routing reduces context switching ","mobile_review_notes":"Ensure the digest cards are readable on small screens: 2-line title clamp, source + timestamp visible, and a single primary action (Assign/Save). Summaries should default to ~280 characters with “Read more” expansion. Provide offline-friend","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-02-18T11:32:38.254337+00:00"},"widget":{"type":"impact_estimator","heading":"Time Saved by Automated News-to-Action Digest","description":"Estimate weekly hours saved by replacing manual scanning and ad-hoc sharing with an automated, deduplicated digest that routes actionable items to the right tool and owner.","config":{"input_label":"Minutes per day currently spent per person on scanning/sharing news","min":0,"max":90,"step":5,"default":25,"baseline_hours":80,"efficiency_factor":0.6}}},{"id":"2026-05-turkish-airlines","month":"2026-05","title":"Rocket Launch Watch: A Developer-Friendly Space Events Digest","trend_keyword":"turkish airlines","description":"Build a monthly, portfolio-ready feature that turns trending interest in космонавтика (cosmonautics) into a practical product: a lightweight “Space Events Digest” that aggregates upcoming rocket launches, mission milestones, and livestream links, then summarizes them into a clean","why_now":"In KZ, interest in космонавтика spikes around launch windows and major mission news. May 2026 is a good time to ship a reliable, automated digest because users search for schedules, livestreams, and quick context—exactly the kind of information that benefits from structured data,","mobile_review_notes":"Ensure the weekly highlight card renders above the fold on 360px width. Use a single-column layout with 44px tap targets for “Watch”, “Add to calendar”, and “Share”. Keep summaries to 280 characters with an expandable “More” section. Cache ","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-05-02T06:08:13.729472+00:00"},"widget":{"type":"roadmap_planner","heading":"Ship plan: Space Events Digest (4–6 weeks)","description":"A practical roadmap to implement an automated космонавтика digest: data sources, normalization, summarization, and a mobile-first feed with calendar export.","config":{"steps":[{"name":"Source discovery & schema","detail":"Identify 2–3 reliable sources (official agency pages, launch schedule sites, RSS/Atom feeds). Define a normalized event schema: mission_name, provider, vehicle, window_start, window_end, location, liv","weeks":0.8},{"name":"Ingestion pipeline","detail":"Implement fetchers with retries, rate limiting, and HTML-to-structured extraction where needed. Store raw payloads for traceability. Schedule daily runs and emit structured events into a database.","weeks":1.2},{"name":"Deduplication & quality rules","detail":"Add canonicalization (time rounding, name normalization), fuzzy matching for mission names, and conflict resolution (prefer official sources). Flag uncertain fields and track provenance per attribute.","weeks":0.9},{"name":"Summaries & localization","detail":"Generate short, factual summaries from structured fields (not freeform scraping). Provide English UI copy and allow optional RU/KZ labels. Add guardrails: no speculation, include source links, and sho","weeks":1},{"name":"Mobile-first UI + calendar export","detail":"Build a feed with filters (This week / This month / By provider) and an event detail view. Add ICS export and deep links to livestreams. Implement caching and skeleton loading for slow networks.","weeks":1.1}]}}},{"id":"2026-06-ai-automation","month":"2026-06","title":"eGov KZ Task Automator: One-Click Document Checklist + Status Tracker","trend_keyword":"AI automation","description":"Build a lightweight web app that helps users and support teams prepare and track common eGov KZ requests (e.g., certificates, registrations) without storing sensitive data. The feature generates a step-by-step checklist, required document list, and a shareable progress link. It a","why_now":"In June 2026, “egov kz” is trending in Kazakhstan, signaling increased demand for digital public services. A practical productivity layer—checklists, status tracking, and standardized summaries—reduces repeated support questions and improves completion rates during peak usage per","mobile_review_notes":"Ensure the checklist is thumb-friendly with large tap targets and offline-first behavior (localStorage/IndexedDB). Avoid collecting personal identifiers; keep notes local-only by default. Provide clear disclaimers that the tool is not an of","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-06-02T08:39:20.470465+00:00"},"widget":{"type":"roadmap_planner","heading":"4-Week Build Plan (Privacy-First)","description":"A practical roadmap to ship an MVP that improves completion rates for eGov-related tasks via checklists, progress tracking, and standardized summaries—without handling sensitive data.","config":{"steps":[{"name":"Scope top 5 workflows + content model","detail":"Select the most common eGov KZ tasks for your audience, define required documents/steps per workflow, and design a JSON schema for checklists, prerequisites, and help text.","weeks":0.8},{"name":"MVP UI: checklist + progress + share link","detail":"Implement a mobile-first checklist with progress indicator, step details, and a shareable read-only link (no PII). Add local-only notes per step.","weeks":1.2},{"name":"Copy-ready request summary + templates","detail":"Generate a standardized summary (task, completed steps, missing docs, questions) with one-tap copy. Add templates for support teams to reduce back-and-forth.","weeks":0.8},{"name":"Reminders + offline-first hardening","detail":"Add optional reminders (calendar export or local notifications where supported), cache assets for offline use, and ensure graceful degradation on older mobile browsers.","weeks":0.7},{"name":"QA, accessibility, and analytics (privacy-safe)","detail":"Test on common KZ devices/browsers, add keyboard and screen-reader support, and implement privacy-safe event tracking (no user content, no identifiers).","weeks":0.5}]}}},{"id":"2026-07-ai-automation","month":"2026-07","title":"Match-Day Automation Pack: Turn Live Sports Spikes into Reliable Ops Signals","trend_keyword":"AI automation","description":"A portfolio-ready feature that helps teams prepare for predictable traffic spikes driven by live events. Using the trend keyword as a proxy for a sudden attention surge, this feature guides an engineer or PM through estimating extra support/ops time, selecting a lightweight mitig","why_now":"In July 2026 (KZ), match-related searches spike around kickoff and key moments. Even if your product is not sports-focused, these bursts mirror real-world demand surges (push notifications, social sharing, streaming, checkout). Packaging a repeatable “spike playbook” as a product","mobile_review_notes":"Keep the estimator as a single-screen flow: one slider + two computed outputs. Use large tap targets and show results in plain language (e.g., “~24 hours saved this month”). Ensure the default value is conservative. Avoid jargon; provide sh","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-07-02T07:34:10.460046+00:00"},"widget":{"type":"impact_estimator","heading":"Spike Readiness Impact Estimator","description":"Estimate how much engineering/ops time you can save per month by implementing a repeatable traffic-spike playbook (caching, rate limiting, queue backpressure, and on-call runbooks) for event-driven surges.","config":{"input_label":"Expected spike events per month","min":0,"max":40,"step":1,"default":6,"baseline_hours":120,"efficiency_factor":0.35}}},{"id":"2026-09-ai-automation","month":"2026-09","title":"AI automation: Monthly AI Feature","trend_keyword":"AI automation","description":"Automatically generated feature from current trend data.","why_now":"Trend data indicates high current interest, making it a useful candidate for quick product experiments.","mobile_review_notes":"Built with responsive layout and mobile-safe controls.","source":{"type":"google_trends","geo":"KZ","captured_at":"2026-09-17T10:54:16.860724+00:00"},"widget":{"type":"impact_estimator","heading":"AI automation: Capacity Estimator","description":"Estimate monthly engineering time unlocked by automation.","config":{"input_label":"Automation coverage","min":0,"max":100,"step":5,"default":50,"baseline_hours":52,"efficiency_factor":0.6}}}]'::jsonb,'2026-09',true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('audience','{"as_of":"2026-09-28","window_weeks":24,"generated_at":"2026-10-05T11:43:32.770168+00:00","status":"ok","methodology":"Weekly audience proxy based on en.wikipedia.org pageviews for each AI product article. This is not unique active users.","source":{"name":"Wikimedia Pageviews API","docs":["https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/tutorials/compare-page-metrics.html","https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/getting-started/"]},"series":[{"id":"chatgpt","label":"ChatGPT","article":"ChatGPT","color":"#22d3ee","points":[{"week":"2026-04-20","views":694467},{"week":"2026-04-27","views":523693},{"week":"2026-05-04","views":311333},{"week":"2026-05-11","views":439789},{"week":"2026-05-18","views":715182},{"week":"2026-05-25","views":701773},{"week":"2026-06-01","views":512421},{"week":"2026-06-08","views":684385},{"week":"2026-06-15","views":695974},{"week":"2026-06-22","views":653016},{"week":"2026-06-29","views":571629},{"week":"2026-07-06","views":649859},{"week":"2026-07-13","views":494176},{"week":"2026-07-20","views":842684},{"week":"2026-07-27","views":534042},{"week":"2026-08-03","views":402893},{"week":"2026-08-10","views":348687},{"week":"2026-08-17","views":410732},{"week":"2026-08-24","views":341801},{"week":"2026-08-31","views":274172},{"week":"2026-09-07","views":438873},{"week":"2026-09-14","views":498549},{"week":"2026-09-21","views":478523},{"week":"2026-09-28","views":317514}]},{"id":"claude","label":"Claude","article":"Claude_(language_model)","color":"#60a5fa","points":[{"week":"2026-04-20","views":61624},{"week":"2026-04-27","views":55303},{"week":"2026-05-04","views":57703},{"week":"2026-05-11","views":53998},{"week":"2026-05-18","views":51656},{"week":"2026-05-25","views":52527},{"week":"2026-06-01","views":51605},{"week":"2026-06-08","views":60808},{"week":"2026-06-15","views":45956},{"week":"2026-06-22","views":12785},{"week":"2026-06-29","views":6583},{"week":"2026-07-06","views":5891},{"week":"2026-07-13","views":5679},{"week":"2026-07-20","views":5518},{"week":"2026-07-27","views":5679},{"week":"2026-08-03","views":4658},{"week":"2026-08-10","views":4658},{"week":"2026-08-17","views":4255},{"week":"2026-08-24","views":4139},{"week":"2026-08-31","views":4208},{"week":"2026-09-07","views":7800},{"week":"2026-09-14","views":7432},{"week":"2026-09-21","views":4643},{"week":"2026-09-28","views":4469}]},{"id":"gemini","label":"Gemini","article":"Gemini_(chatbot)","color":"#a78bfa","points":[{"week":"2026-04-20","views":1140},{"week":"2026-04-27","views":1167},{"week":"2026-05-04","views":1159},{"week":"2026-05-11","views":1162},{"week":"2026-05-18","views":1488},{"week":"2026-05-25","views":1240},{"week":"2026-06-01","views":1462},{"week":"2026-06-08","views":1218},{"week":"2026-06-15","views":1332},{"week":"2026-06-22","views":1180},{"week":"2026-06-29","views":950},{"week":"2026-07-06","views":989},{"week":"2026-07-13","views":966},{"week":"2026-07-20","views":1154},{"week":"2026-07-27","views":1759},{"week":"2026-08-03","views":2471},{"week":"2026-08-10","views":1062},{"week":"2026-08-17","views":983},{"week":"2026-08-24","views":946},{"week":"2026-08-31","views":1066},{"week":"2026-09-07","views":1150},{"week":"2026-09-14","views":1262},{"week":"2026-09-21","views":1290},{"week":"2026-09-28","views":1149}]},{"id":"copilot","label":"Copilot","article":"Microsoft_Copilot","color":"#34d399","points":[{"week":"2026-04-20","views":16279},{"week":"2026-04-27","views":14622},{"week":"2026-05-04","views":14430},{"week":"2026-05-11","views":14519},{"week":"2026-05-18","views":10899},{"week":"2026-05-25","views":12957},{"week":"2026-06-01","views":16115},{"week":"2026-06-08","views":16534},{"week":"2026-06-15","views":13809},{"week":"2026-06-22","views":13303},{"week":"2026-06-29","views":11010},{"week":"2026-07-06","views":15140},{"week":"2026-07-13","views":11980},{"week":"2026-07-20","views":11322},{"week":"2026-07-27","views":10734},{"week":"2026-08-03","views":8067},{"week":"2026-08-10","views":5943},{"week":"2026-08-17","views":7341},{"week":"2026-08-24","views":7967},{"week":"2026-08-31","views":7414},{"week":"2026-09-07","views":10480},{"week":"2026-09-14","views":9359},{"week":"2026-09-21","views":8389},{"week":"2026-09-28","views":7861}]},{"id":"perplexity","label":"Perplexity","article":"Perplexity_AI","color":"#f59e0b","points":[{"week":"2026-04-20","views":22822},{"week":"2026-04-27","views":20781},{"week":"2026-05-04","views":21916},{"week":"2026-05-11","views":21210},{"week":"2026-05-18","views":21058},{"week":"2026-05-25","views":19162},{"week":"2026-06-01","views":20485},{"week":"2026-06-08","views":21621},{"week":"2026-06-15","views":21580},{"week":"2026-06-22","views":17330},{"week":"2026-06-29","views":22568},{"week":"2026-07-06","views":19614},{"week":"2026-07-13","views":18747},{"week":"2026-07-20","views":14705},{"week":"2026-07-27","views":14487},{"week":"2026-08-03","views":15291},{"week":"2026-08-10","views":13919},{"week":"2026-08-17","views":14398},{"week":"2026-08-24","views":16755},{"week":"2026-08-31","views":16534},{"week":"2026-09-07","views":16977},{"week":"2026-09-14","views":17269},{"week":"2026-09-21","views":16855},{"week":"2026-09-28","views":15470}]},{"id":"deepseek","label":"DeepSeek","article":"DeepSeek","color":"#f472b6","points":[{"week":"2026-04-20","views":17026},{"week":"2026-04-27","views":15854},{"week":"2026-05-04","views":17526},{"week":"2026-05-11","views":17099},{"week":"2026-05-18","views":16313},{"week":"2026-05-25","views":15200},{"week":"2026-06-01","views":15877},{"week":"2026-06-08","views":15509},{"week":"2026-06-15","views":15685},{"week":"2026-06-22","views":14693},{"week":"2026-06-29","views":12241},{"week":"2026-07-06","views":13327},{"week":"2026-07-13","views":15428},{"week":"2026-07-20","views":14267},{"week":"2026-07-27","views":13458},{"week":"2026-08-03","views":12838},{"week":"2026-08-10","views":12813},{"week":"2026-08-17","views":14036},{"week":"2026-08-24","views":14885},{"week":"2026-08-31","views":14502},{"week":"2026-09-07","views":19173},{"week":"2026-09-14","views":23862},{"week":"2026-09-21","views":20948},{"week":"2026-09-28","views":19192}]}],"latest_rank":[{"id":"chatgpt","label":"ChatGPT","views":317514},{"id":"deepseek","label":"DeepSeek","views":19192},{"id":"perplexity","label":"Perplexity","views":15470},{"id":"copilot","label":"Copilot","views":7861},{"id":"claude","label":"Claude","views":4469},{"id":"gemini","label":"Gemini","views":1149}],"errors":[]}'::jsonb,'2026-09-28',true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

insert into public.content_snapshots (key,payload,as_of,published)
values ('keywords','[{"keyword":"ETL","category":"data","weight":0.95,"aliases":["extract transform load"],"link":"#projects?kw=etl"},{"keyword":"Apache Spark","category":"data","weight":0.92,"aliases":["pyspark","spark"],"link":"#projects?kw=spark"},{"keyword":"Apache Kafka","category":"data","weight":0.9,"aliases":["kafka streams"],"link":"#projects?kw=kafka"},{"keyword":"Airflow","category":"data","weight":0.88,"aliases":["apache airflow","dag"],"link":"#projects?kw=airflow"},{"keyword":"Data Mesh","category":"data","weight":0.7,"aliases":["domain-driven data"],"link":"#projects?kw=data-mesh"},{"keyword":"Schema Design","category":"data","weight":0.75,"aliases":["star schema","snowflake schema"],"link":"#projects?kw=schema"},{"keyword":"T-SQL","category":"data","weight":0.8,"aliases":["transact-sql"],"link":"#projects?kw=tsql"},{"keyword":"PostgreSQL","category":"data","weight":0.9,"aliases":["postgres"],"link":"#projects?kw=postgresql"},{"keyword":"Data Warehouse","category":"data","weight":0.85,"aliases":["dwh","olap"],"link":"#projects?kw=dwh"},{"keyword":"Data Lake","category":"data","weight":0.78,"aliases":["lakehouse"],"link":"#projects?kw=datalake"},{"keyword":"Hadoop","category":"data","weight":0.82,"aliases":["hdfs","mapreduce"],"link":"#projects?kw=hadoop"},{"keyword":"dbt","category":"data","weight":0.76,"aliases":["data build tool"],"link":"#projects?kw=dbt"},{"keyword":"Data Quality","category":"data","weight":0.72,"aliases":["great expectations","deequ"],"link":"#projects?kw=quality"},{"keyword":"CDC","category":"data","weight":0.68,"aliases":["change data capture","debezium"],"link":"#projects?kw=cdc"},{"keyword":"Batch Processing","category":"data","weight":0.74,"aliases":["batch etl"],"link":"#projects?kw=batch"},{"keyword":"Stream Processing","category":"data","weight":0.8,"aliases":["real-time","flink"],"link":"#projects?kw=streaming"},{"keyword":"Data Modeling","category":"data","weight":0.82,"aliases":["kimball","inmon"],"link":"#projects?kw=modeling"},{"keyword":"Oracle DB","category":"data","weight":0.75,"aliases":["oracle","plsql"],"link":"#projects?kw=oracle"},{"keyword":"MySQL","category":"data","weight":0.72,"aliases":["mariadb"],"link":"#projects?kw=mysql"},{"keyword":"MSSQL","category":"data","weight":0.7,"aliases":["sql server"],"link":"#projects?kw=mssql"},{"keyword":"Python","category":"software","weight":0.95,"aliases":["py","cpython"],"link":"#projects?kw=python"},{"keyword":"FastAPI","category":"software","weight":0.85,"aliases":["async api"],"link":"#projects?kw=fastapi"},{"keyword":"Go","category":"software","weight":0.78,"aliases":["golang"],"link":"#projects?kw=go"},{"keyword":"Java","category":"software","weight":0.8,"aliases":["jvm","spring"],"link":"#projects?kw=java"},{"keyword":"REST API","category":"software","weight":0.82,"aliases":["restful"],"link":"#projects?kw=rest"},{"keyword":"Microservices","category":"software","weight":0.76,"aliases":["micro-services"],"link":"#projects?kw=microservices"},{"keyword":"Clean Code","category":"software","weight":0.7,"aliases":["solid","dry"],"link":"#projects?kw=cleancode"},{"keyword":"TDD","category":"software","weight":0.65,"aliases":["test driven development"],"link":"#projects?kw=tdd"},{"keyword":"CI/CD","category":"infra","weight":0.85,"aliases":["github actions","jenkins"],"link":"#projects?kw=cicd"},{"keyword":"Docker","category":"infra","weight":0.92,"aliases":["containers","dockerfile"],"link":"#projects?kw=docker"},{"keyword":"Kubernetes","category":"infra","weight":0.8,"aliases":["k8s"],"link":"#projects?kw=k8s"},{"keyword":"Linux","category":"infra","weight":0.85,"aliases":["ubuntu","centos"],"link":"#projects?kw=linux"},{"keyword":"Git","category":"infra","weight":0.88,"aliases":["version control"],"link":"#projects?kw=git"},{"keyword":"AWS","category":"infra","weight":0.78,"aliases":["amazon web services","s3","ec2"],"link":"#projects?kw=aws"},{"keyword":"Terraform","category":"infra","weight":0.65,"aliases":["iac","infrastructure as code"],"link":"#projects?kw=terraform"},{"keyword":"Monitoring","category":"infra","weight":0.68,"aliases":["grafana","prometheus"],"link":"#projects?kw=monitoring"},{"keyword":"Scikit-learn","category":"tooling","weight":0.85,"aliases":["sklearn"],"link":"#projects?kw=sklearn"},{"keyword":"TensorFlow","category":"tooling","weight":0.82,"aliases":["tf"],"link":"#projects?kw=tensorflow"},{"keyword":"PyTorch","category":"tooling","weight":0.8,"aliases":["torch"],"link":"#projects?kw=pytorch"},{"keyword":"Pandas","category":"tooling","weight":0.9,"aliases":["dataframe"],"link":"#projects?kw=pandas"},{"keyword":"NumPy","category":"tooling","weight":0.85,"aliases":["numerical python"],"link":"#projects?kw=numpy"},{"keyword":"Jupyter","category":"tooling","weight":0.75,"aliases":["notebook","ipython"],"link":"#projects?kw=jupyter"},{"keyword":"Bash","category":"software","weight":0.72,"aliases":["shell","scripting"],"link":"#projects?kw=bash"},{"keyword":"SQL Optimization","category":"data","weight":0.88,"aliases":["query tuning","explain plan"],"link":"#projects?kw=sqlopt"},{"keyword":"Data Pipeline","category":"data","weight":0.9,"aliases":["pipeline orchestration"],"link":"#projects?kw=pipeline"},{"keyword":"Partitioning","category":"data","weight":0.7,"aliases":["sharding"],"link":"#projects?kw=partitioning"},{"keyword":"Indexing","category":"data","weight":0.72,"aliases":["b-tree","hash index"],"link":"#projects?kw=indexing"},{"keyword":"Redis","category":"software","weight":0.74,"aliases":["cache","in-memory"],"link":"#projects?kw=redis"},{"keyword":"gRPC","category":"software","weight":0.68,"aliases":["protobuf"],"link":"#projects?kw=grpc"},{"keyword":"Keras","category":"tooling","weight":0.75,"aliases":["deep learning"],"link":"#projects?kw=keras"},{"keyword":"Feature Engineering","category":"data","weight":0.78,"aliases":["feature store"],"link":"#projects?kw=features"},{"keyword":"ELT","category":"data","weight":0.76,"aliases":["extract load transform"],"link":"#projects?kw=elt"},{"keyword":"Dagster","category":"data","weight":0.6,"aliases":["orchestrator"],"link":"#projects?kw=dagster"},{"keyword":"Prefect","category":"data","weight":0.58,"aliases":["workflow"],"link":"#projects?kw=prefect"},{"keyword":"Data Governance","category":"data","weight":0.65,"aliases":["data catalog","lineage"],"link":"#projects?kw=governance"},{"keyword":"Parquet","category":"data","weight":0.72,"aliases":["columnar","avro","orc"],"link":"#projects?kw=parquet"},{"keyword":"Delta Lake","category":"data","weight":0.7,"aliases":["acid","time travel"],"link":"#projects?kw=deltalake"},{"keyword":"Concurrency","category":"software","weight":0.72,"aliases":["async","threading","multiprocessing"],"link":"#projects?kw=concurrency"},{"keyword":"Design Patterns","category":"software","weight":0.7,"aliases":["factory","singleton","observer"],"link":"#projects?kw=patterns"},{"keyword":"OOP","category":"software","weight":0.74,"aliases":["object oriented"],"link":"#projects?kw=oop"},{"keyword":"Networking","category":"infra","weight":0.62,"aliases":["tcp/ip","dns","http"],"link":"#projects?kw=networking"},{"keyword":"S3","category":"infra","weight":0.72,"aliases":["object storage","minio"],"link":"#projects?kw=s3"},{"keyword":"Spark SQL","category":"data","weight":0.82,"aliases":["spark dataframe"],"link":"#projects?kw=sparksql"},{"keyword":"PySpark","category":"data","weight":0.84,"aliases":["spark python"],"link":"#projects?kw=pyspark"},{"keyword":"Data Ingestion","category":"data","weight":0.78,"aliases":["ingest","source connectors"],"link":"#projects?kw=ingestion"},{"keyword":"Window Functions","category":"data","weight":0.76,"aliases":["rank","row_number","lead lag"],"link":"#projects?kw=windowfn"},{"keyword":"CTE","category":"data","weight":0.7,"aliases":["common table expression","recursive cte"],"link":"#projects?kw=cte"},{"keyword":"Stored Procedures","category":"data","weight":0.66,"aliases":["sproc","pl/pgsql"],"link":"#projects?kw=sprocs"},{"keyword":"MLOps","category":"tooling","weight":0.72,"aliases":["mlflow","model registry"],"link":"#projects?kw=mlops"},{"keyword":"Data Visualization","category":"tooling","weight":0.7,"aliases":["matplotlib","plotly","seaborn"],"link":"#projects?kw=dataviz"},{"keyword":"API Gateway","category":"software","weight":0.64,"aliases":["kong","nginx"],"link":"#projects?kw=apigateway"},{"keyword":"Message Queue","category":"software","weight":0.72,"aliases":["rabbitmq","celery"],"link":"#projects?kw=mq"},{"keyword":"Normalization","category":"data","weight":0.68,"aliases":["1nf","2nf","3nf","bcnf"],"link":"#projects?kw=normalization"},{"keyword":"Dimensional Modeling","category":"data","weight":0.74,"aliases":["fact table","dimension table"],"link":"#projects?kw=dimmodel"},{"keyword":"SCD","category":"data","weight":0.66,"aliases":["slowly changing dimension","type 2"],"link":"#projects?kw=scd"},{"keyword":"Idempotency","category":"software","weight":0.64,"aliases":["idempotent"],"link":"#projects?kw=idempotent"},{"keyword":"Logging","category":"infra","weight":0.68,"aliases":["elk","fluentd"],"link":"#projects?kw=logging"},{"keyword":"Scheduling","category":"data","weight":0.72,"aliases":["cron","dag scheduling"],"link":"#projects?kw=scheduling"},{"keyword":"Data Contracts","category":"data","weight":0.62,"aliases":["schema registry"],"link":"#projects?kw=contracts"},{"keyword":"JSON/Avro","category":"data","weight":0.66,"aliases":["serialization","protobuf"],"link":"#projects?kw=serialization"},{"keyword":"Snowflake","category":"data","weight":0.74,"aliases":["cloud dwh"],"link":"#projects?kw=snowflake"},{"keyword":"BigQuery","category":"data","weight":0.72,"aliases":["gcp bigquery"],"link":"#projects?kw=bigquery"},{"keyword":"Redshift","category":"data","weight":0.66,"aliases":["aws redshift"],"link":"#projects?kw=redshift"},{"keyword":"ClickHouse","category":"data","weight":0.62,"aliases":["olap db"],"link":"#projects?kw=clickhouse"},{"keyword":"Trino","category":"data","weight":0.6,"aliases":["presto","sql query engine"],"link":"#projects?kw=trino"},{"keyword":"Iceberg","category":"data","weight":0.62,"aliases":["apache iceberg"],"link":"#projects?kw=iceberg"},{"keyword":"Great Expectations","category":"data","weight":0.6,"aliases":["data tests","dq"],"link":"#projects?kw=great-expectations"},{"keyword":"dbt Core","category":"data","weight":0.68,"aliases":["dbt","analytics engineering"],"link":"#projects?kw=dbt-core"},{"keyword":"Kimball","category":"data","weight":0.6,"aliases":["dimensional modeling"],"link":"#projects?kw=kimball"},{"keyword":"Star Schema","category":"data","weight":0.62,"aliases":["facts","dimensions"],"link":"#projects?kw=star-schema"},{"keyword":"Flink","category":"data","weight":0.62,"aliases":["stream processing"],"link":"#projects?kw=flink"},{"keyword":"Kafka Connect","category":"data","weight":0.6,"aliases":["connectors"],"link":"#projects?kw=kafka-connect"},{"keyword":"Debezium","category":"data","weight":0.6,"aliases":["cdc"],"link":"#projects?kw=debezium"},{"keyword":"Data Lineage","category":"data","weight":0.58,"aliases":["openlineage","marquez"],"link":"#projects?kw=lineage"},{"keyword":"Data Catalog","category":"data","weight":0.58,"aliases":["amundsen","datahub"],"link":"#projects?kw=catalog"},{"keyword":"Lakehouse","category":"data","weight":0.62,"aliases":["delta","iceberg"],"link":"#projects?kw=lakehouse"},{"keyword":"Partition Pruning","category":"data","weight":0.56,"aliases":["query performance"],"link":"#projects?kw=partition-pruning"},{"keyword":"SLA/SLO","category":"infra","weight":0.56,"aliases":["service reliability"],"link":"#projects?kw=sla-slo"},{"keyword":"Observability","category":"infra","weight":0.62,"aliases":["tracing","metrics","logs"],"link":"#projects?kw=observability"},{"keyword":"Backpressure","category":"data","weight":0.54,"aliases":["streaming"],"link":"#projects?kw=backpressure"},{"keyword":"Data SLA","category":"data","weight":0.56,"aliases":["freshness","latency"],"link":"#projects?kw=data-sla"},{"keyword":"Data Freshness","category":"data","weight":0.56,"aliases":["freshness checks"],"link":"#projects?kw=freshness"},{"keyword":"Query Tuning","category":"data","weight":0.64,"aliases":["explain","indexes"],"link":"#projects?kw=query-tuning"},{"keyword":"Materialized Views","category":"data","weight":0.58,"aliases":["mv","precompute"],"link":"#projects?kw=materialized-views"},{"keyword":"Airflow DAGs","category":"data","weight":0.64,"aliases":["orchestration"],"link":"#projects?kw=airflow-dags"},{"keyword":"GCP","category":"infra","weight":0.64,"aliases":["google cloud","cloud functions","app engine"],"link":"#projects?kw=gcp"},{"keyword":"Cloud SQL","category":"infra","weight":0.58,"aliases":["managed postgres","managed mysql"],"link":"#projects?kw=cloud-sql"},{"keyword":"Cloud Storage","category":"infra","weight":0.58,"aliases":["gcs","object storage"],"link":"#projects?kw=cloud-storage"},{"keyword":"App Engine","category":"infra","weight":0.52,"aliases":["gcp app engine"],"link":"#projects?kw=app-engine"},{"keyword":"Cloud Functions","category":"infra","weight":0.54,"aliases":["serverless"],"link":"#projects?kw=cloud-functions"},{"keyword":"DataOps","category":"data","weight":0.56,"aliases":["deployment","automation"],"link":"#projects?kw=dataops"},{"keyword":"PL/SQL","category":"data","weight":0.82,"aliases":["oracle plsql","procedural sql"],"link":"#projects?kw=plsql"},{"keyword":"Power BI","category":"tooling","weight":0.76,"aliases":["microsoft power bi","dax"],"link":"#projects?kw=powerbi"},{"keyword":"Grafana","category":"infra","weight":0.66,"aliases":["dashboards","metrics"],"link":"#projects?kw=grafana"},{"keyword":"Excel","category":"tooling","weight":0.68,"aliases":["spreadsheets","pivot tables"],"link":"#projects?kw=excel"},{"keyword":"Jira","category":"software","weight":0.62,"aliases":["agile","project management"],"link":"#projects?kw=jira"},{"keyword":"Confluence","category":"software","weight":0.58,"aliases":["documentation","wiki"],"link":"#projects?kw=confluence"},{"keyword":"GitLab","category":"infra","weight":0.66,"aliases":["gitlab ci","version control"],"link":"#projects?kw=gitlab"},{"keyword":"XML","category":"data","weight":0.54,"aliases":["markup","xml schema"],"link":"#projects?kw=xml"},{"keyword":"YOLO","category":"tooling","weight":0.7,"aliases":["object detection","computer vision"],"link":"#projects?kw=yolo"},{"keyword":"LabelImg","category":"tooling","weight":0.52,"aliases":["annotation","labeling"],"link":"#projects?kw=labelimg"},{"keyword":"Data Architecture","category":"data","weight":0.84,"aliases":["enterprise architecture","data design"],"link":"#projects?kw=data-architecture"},{"keyword":"OLTP","category":"data","weight":0.68,"aliases":["transactional processing"],"link":"#projects?kw=oltp"},{"keyword":"OLAP","category":"data","weight":0.7,"aliases":["analytical processing"],"link":"#projects?kw=olap"},{"keyword":"Data Mesh Patterns","category":"data","weight":0.64,"aliases":["domain ownership","federated"],"link":"#projects?kw=data-mesh-patterns"},{"keyword":"Apache Hive","category":"data","weight":0.68,"aliases":["hive","hiveql"],"link":"#projects?kw=hive"},{"keyword":"Apache Pig","category":"data","weight":0.54,"aliases":["pig latin"],"link":"#projects?kw=pig"},{"keyword":"Data Versioning","category":"data","weight":0.58,"aliases":["dvc","data version control"],"link":"#projects?kw=data-versioning"},{"keyword":"Feature Store","category":"data","weight":0.62,"aliases":["feast","tecton"],"link":"#projects?kw=feature-store"},{"keyword":"Change Data Capture","category":"data","weight":0.66,"aliases":["cdc streaming"],"link":"#projects?kw=cdc-streaming"},{"keyword":"Incremental Load","category":"data","weight":0.64,"aliases":["incremental etl"],"link":"#projects?kw=incremental-load"},{"keyword":"Full Load","category":"data","weight":0.56,"aliases":["full refresh"],"link":"#projects?kw=full-load"},{"keyword":"Data Deduplication","category":"data","weight":0.58,"aliases":["dedup"],"link":"#projects?kw=deduplication"},{"keyword":"Data Masking","category":"data","weight":0.54,"aliases":["anonymization","obfuscation"],"link":"#projects?kw=data-masking"},{"keyword":"PII Handling","category":"data","weight":0.56,"aliases":["personally identifiable information"],"link":"#projects?kw=pii"},{"keyword":"Data Security","category":"data","weight":0.66,"aliases":["encryption","access control"],"link":"#projects?kw=data-security"},{"keyword":"Row-Level Security","category":"data","weight":0.54,"aliases":["rls"],"link":"#projects?kw=rls"},{"keyword":"Column-Level Security","category":"data","weight":0.52,"aliases":["cls"],"link":"#projects?kw=cls"},{"keyword":"Data Partitioning Strategy","category":"data","weight":0.62,"aliases":["partition scheme"],"link":"#projects?kw=partition-strategy"},{"keyword":"Data Skew","category":"data","weight":0.58,"aliases":["skew handling"],"link":"#projects?kw=data-skew"},{"keyword":"Broadcast Join","category":"data","weight":0.56,"aliases":["map-side join"],"link":"#projects?kw=broadcast-join"},{"keyword":"Shuffle Join","category":"data","weight":0.54,"aliases":["sort-merge join"],"link":"#projects?kw=shuffle-join"},{"keyword":"Cost-Based Optimizer","category":"data","weight":0.6,"aliases":["cbo","query optimizer"],"link":"#projects?kw=cbo"},{"keyword":"Query Plan Analysis","category":"data","weight":0.62,"aliases":["explain plan"],"link":"#projects?kw=query-plan"},{"keyword":"ACID Transactions","category":"data","weight":0.66,"aliases":["atomicity","consistency"],"link":"#projects?kw=acid"},{"keyword":"CAP Theorem","category":"data","weight":0.54,"aliases":["consistency availability partition"],"link":"#projects?kw=cap"},{"keyword":"Eventual Consistency","category":"data","weight":0.56,"aliases":["weak consistency"],"link":"#projects?kw=eventual-consistency"},{"keyword":"Data Replication","category":"data","weight":0.6,"aliases":["master-slave","leader-follower"],"link":"#projects?kw=replication"},{"keyword":"Sharding","category":"data","weight":0.62,"aliases":["horizontal partitioning"],"link":"#projects?kw=sharding"},{"keyword":"Time Travel Queries","category":"data","weight":0.58,"aliases":["temporal queries"],"link":"#projects?kw=time-travel"},{"keyword":"Data Retention Policy","category":"data","weight":0.54,"aliases":["data lifecycle"],"link":"#projects?kw=retention-policy"},{"keyword":"Hot/Cold Storage","category":"data","weight":0.56,"aliases":["tiered storage"],"link":"#projects?kw=tiered-storage"},{"keyword":"Compaction","category":"data","weight":0.52,"aliases":["small file problem"],"link":"#projects?kw=compaction"},{"keyword":"Vacuum","category":"data","weight":0.5,"aliases":["cleanup"],"link":"#projects?kw=vacuum"},{"keyword":"Data Sampling","category":"data","weight":0.54,"aliases":["reservoir sampling"],"link":"#projects?kw=sampling"},{"keyword":"Bloom Filter","category":"data","weight":0.52,"aliases":["probabilistic data structure"],"link":"#projects?kw=bloom-filter"},{"keyword":"HyperLogLog","category":"data","weight":0.48,"aliases":["cardinality estimation"],"link":"#projects?kw=hyperloglog"},{"keyword":"Columnar Storage","category":"data","weight":0.64,"aliases":["column-oriented"],"link":"#projects?kw=columnar"},{"keyword":"Row Storage","category":"data","weight":0.52,"aliases":["row-oriented"],"link":"#projects?kw=row-storage"},{"keyword":"Vector Databases","category":"data","weight":0.6,"aliases":["milvus","pinecone","weaviate"],"link":"#projects?kw=vector-db"},{"keyword":"Embedding Pipelines","category":"data","weight":0.58,"aliases":["vector embeddings"],"link":"#projects?kw=embeddings"},{"keyword":"Real-Time Analytics","category":"data","weight":0.72,"aliases":["stream analytics"],"link":"#projects?kw=realtime-analytics"},{"keyword":"Lambda Architecture","category":"data","weight":0.56,"aliases":["batch + stream"],"link":"#projects?kw=lambda"},{"keyword":"Kappa Architecture","category":"data","weight":0.54,"aliases":["stream-only"],"link":"#projects?kw=kappa"},{"keyword":"Reverse ETL","category":"data","weight":0.58,"aliases":["operational analytics"],"link":"#projects?kw=reverse-etl"},{"keyword":"Data Observability","category":"data","weight":0.62,"aliases":["monitoring data"],"link":"#projects?kw=data-observability"},{"keyword":"Data Testing","category":"data","weight":0.6,"aliases":["unit tests for data"],"link":"#projects?kw=data-testing"},{"keyword":"Schema Evolution","category":"data","weight":0.6,"aliases":["schema migration"],"link":"#projects?kw=schema-evolution"},{"keyword":"Metadata Management","category":"data","weight":0.58,"aliases":["data dictionary"],"link":"#projects?kw=metadata"},{"keyword":"Data Drift","category":"data","weight":0.54,"aliases":["schema drift"],"link":"#projects?kw=data-drift"},{"keyword":"Data Pipelines as Code","category":"data","weight":0.6,"aliases":["declarative pipelines"],"link":"#projects?kw=pipelines-as-code"},{"keyword":"SQL on Hadoop","category":"data","weight":0.56,"aliases":["hive","impala","presto"],"link":"#projects?kw=sql-hadoop"},{"keyword":"Distributed SQL","category":"data","weight":0.58,"aliases":["cockroachdb","yugabyte"],"link":"#projects?kw=distributed-sql"},{"keyword":"NoSQL","category":"data","weight":0.66,"aliases":["mongodb","cassandra","dynamodb"],"link":"#projects?kw=nosql"},{"keyword":"Graph Databases","category":"data","weight":0.58,"aliases":["neo4j","graph queries"],"link":"#projects?kw=graph-db"},{"keyword":"Time-Series DB","category":"data","weight":0.6,"aliases":["influxdb","timescaledb"],"link":"#projects?kw=timeseries-db"},{"keyword":"Data Virtualization","category":"data","weight":0.52,"aliases":["virtual data layer"],"link":"#projects?kw=data-virtualization"},{"keyword":"Data Federation","category":"data","weight":0.5,"aliases":["federated queries"],"link":"#projects?kw=data-federation"}]'::jsonb,null,true)
on conflict (key) do update set payload = excluded.payload, as_of = excluded.as_of, published = excluded.published;

commit;
