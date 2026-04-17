// ── Curriculum Data — sourced from AWS_DE_Complete_Tracker.pdf ────────────
const PHASES = [
  {
    id:"p0", num:"00", title:"Absolute Basics", sub:"Week 1–2",
    color:"#9333ea", emoji:"🧱",
    desc:"Math, English, CS Fundamentals — the foundation 90% of candidates skip",
    skills:[
      { id:"math", name:"Mathematics Basics", week:"1", days:[
        "Khan Academy: Ratios & Percentages module (1 hr). Practice: calculate 15% of 240, find ratio of 3:7 in 100 items.",
        "Khan Academy: Mean, Median, Mode, Range. Practice: find mean/median of [12,45,7,23,89,34,11].",
        "Khan Academy: Variance & Standard Deviation. Understand what 'spread of data' means for pipeline anomaly detection.",
        "Khan Academy: Basic Algebra — solve 5 equations. Reading bar charts and line graphs on mathsisfun.com.",
        "Review day: take Khan Academy Statistics unit test. Score 80%+ before moving on."
      ], where:"Khan Academy (khanacademy.org) | StatQuest YouTube | mathsisfun.com",
         why:"Every data quality check uses math. Variance/std-dev detect anomalies in pipelines.",
         impact:"FOUNDATIONAL — Used daily in pipeline validation and anomaly detection.",
         taster:{name:"Data Quality Math Check", desc:"Python script: reads CSV, prints row count, mean, median, std dev, flags values >2 std devs from mean as an anomaly.", skills:["Math","Python basics"]}
      },
      { id:"english", name:"English for Tech Communication", week:"1–2", days:[
        "BBC Learning English: 30 min. Learn 5 DE vocab words: pipeline, ingestion, schema, transformation, orchestration. Write one sentence using each.",
        "Read one AWS blog post. Underline every word you don't understand. Look up all of them. Grammarly: check your own sentences.",
        "Learn 5 more words: partition, latency, throughput, idempotent, lineage. Write a 3-sentence explanation of what a data pipeline does.",
        "Read a GitHub README of a popular project. Write your own README for an imaginary project using the same structure.",
        "Learn 5 more words: replication, fault-tolerance, scalability, observability, schema-evolution. Practice explaining them out loud.",
        "Write a mock Slack message: 'The Glue job failed due to schema mismatch. I fixed it and the pipeline is now running.' Use Grammarly.",
        "Record yourself explaining what a data engineer does in 60 seconds. Play it back. Redo until it sounds confident."
      ], where:"BBC Learning English (bbclearningenglish.com) | Grammarly (free plugin) | ChatGPT for writing improvement",
         why:"GitHub README and interview explanations are judged on English quality. Strong English makes every skill look better.",
         impact:"FOUNDATIONAL — Interview communication is 50% of the score.",
         taster:null
      },
      { id:"cs_basics", name:"CS Fundamentals & Linux", week:"2", days:[
        "CS50 Week 0: watch lecture (2 hrs). Understand bits, bytes, KB/MB/GB/TB. Practice: how many rows fit in 100MB CSV if each row is 500 bytes?",
        "Learn file formats: open a CSV, JSON, and XML file in a text editor. Understand the structure. When would you use each?",
        "Linux: install WSL or use a free EC2. Practice: cd, ls, pwd, mkdir, touch, cat, cp, mv, rm. Navigate without looking up commands.",
        "Linux text tools: grep, head, tail, wc -l. Practice on a real CSV: count rows, find rows with 'error', show first 5 lines.",
        "What is an API? HTTP request/response cycle. Use curl to call a free API (wttr.in/Delhi for weather). Read the JSON response."
      ], where:"CS50 (cs50.harvard.edu, free) | The Missing Semester MIT (missing.csail.mit.edu) | linuxcommand.org",
         why:"DE engineers run pipelines on Linux servers. Terminal skills are used daily for log inspection, scheduling jobs, debugging.",
         impact:"FOUNDATIONAL — Linux knowledge is assumed in every DE role.",
         taster:{name:"Log File Inspector", desc:"Bash commands: count total lines, find all 404 errors, count unique IP addresses, show the last 20 lines of a log file.", skills:["Linux","Bash"]}
      }
    ]
  },
  {
    id:"p1", num:"01", title:"Beginner Core", sub:"Week 3–6",
    color:"#0f766e", emoji:"🐣",
    desc:"Python, SQL, Git, Linux — the language of data engineering",
    skills:[
      { id:"python_basics", name:"Python Foundation", week:"3–4", days:[
        "Install Python + VS Code. Write hello world. Variables: str, int, float, bool. Print your name, age, city.",
        "Lists and dictionaries: create a list of 5 cities, a dict of {city: population}. Access, update, delete items.",
        "For loops and while loops: loop through your cities list. Print each with its index. Find the city with highest population.",
        "Functions: write add(a,b), is_even(n), find_max(lst). Call them with different inputs. Understand return vs print.",
        "If/elif/else: write a function that classifies a number as 'small'(<10), 'medium'(10-100), or 'large'(>100).",
        "File handling: write a list of 10 names to a .txt file. Read it back. Count lines. This is your first mini file pipeline.",
        "Read a CSV with open(). Parse each row manually (split by comma). Print the 3rd column of every row.",
        "Error handling: try/except/finally. Wrap your CSV reader so it doesn't crash on missing files. Print a helpful error message.",
        "Import os and pathlib. List all files in a folder. Create folders. Check if a file exists. Used in every DE pipeline.",
        "Import datetime. Get today's date, format as YYYY-MM-DD. Calculate days between two dates. Generate a date range.",
        "import json: read a JSON file, access nested keys, write modified JSON back. This is API response handling.",
        "Virtual environments: python -m venv, activate, pip install, requirements.txt. Set this up for every project.",
        "Automate the Boring Stuff Ch.9: Organizing Files. Read + do all exercises. Rename 20 files automatically.",
        "Build Day: reads a CSV, filters rows where a column > threshold, writes filtered rows to a new CSV."
      ], where:"Automate the Boring Stuff (automatetheboringstuff.com, free) | Python.org tutorial | freeCodeCamp Python YouTube",
         why:"Python is the #1 language in DE. Every Airflow DAG, Glue job, Lambda, and API script is Python.",
         impact:"CRITICAL — In 100% of DE job postings. The foundation of your entire career.",
         taster:{name:"Mini CSV ETL Pipeline", desc:"Read sales.csv → filter rows where sales > 1000 → add a 'category' column based on product type → write to processed_sales.csv. Use only the csv module — no Pandas yet.", skills:["Python"]}
      },
      { id:"sql_basics", name:"SQL & MySQL Foundation", week:"3–6", days:[
        "Install MySQL + DBeaver (free). Create database 'store'. Create table: customers(id, name, city, email, created_at). MySQL is the #1 source DB at Indian tech companies — Flipkart, Razorpay, Swiggy all run MySQL.",
        "INSERT 20 rows of fake customer data. SELECT * FROM customers. SELECT specific columns. WHERE city = 'Delhi'.",
        "ORDER BY, LIMIT: top 5 newest customers. DISTINCT: unique cities. COUNT(*): how many customers per city.",
        "CREATE orders table (id, customer_id, product, amount, order_date). Insert 50 orders. Practice SELECT with WHERE.",
        "Aggregate functions: SUM(amount), AVG(amount), MIN, MAX. GROUP BY city. HAVING AVG(amount) > 500.",
        "INNER JOIN customers and orders: show customer name + their total orders. Understand what rows appear and why.",
        "LEFT JOIN: show ALL customers even if they have no orders. Understand NULL in joined columns.",
        "Subqueries: find customers whose total spend > average total spend. Write as subquery first, then as CTE.",
        "CTEs (WITH clause): rewrite yesterday's subquery as a CTE. Write a 2-CTE query: monthly_sales then top_months.",
        "NULL handling: COALESCE, NULLIF, IS NULL / IS NOT NULL. Fix NULLs in your data using UPDATE + COALESCE.",
        "String functions: UPPER, LOWER, TRIM, CONCAT, SUBSTRING, LIKE. Clean messy name data.",
        "MySQL date functions: YEAR(order_date), MONTH(order_date), DATE_FORMAT(order_date,'%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 1 DAY). Monthly revenue report. MySQL uses DATE_FORMAT instead of PostgreSQL's DATE_TRUNC.",
        "DataLemur.com: create free account. Solve 5 easy problems. These are real interview questions from Amazon, Uber, etc.",
        "DataLemur: solve 5 more easy problems. Aim for under 10 minutes per problem. This streak continues every day."
      ], where:"SQLZoo (sqlzoo.net, free) | DataLemur.com | Mode Analytics SQL Tutorial | MySQL Official Docs (dev.mysql.com)",
         why:"SQL is used every single day: dbt transforms, Athena queries, Redshift debugging. Window functions appear in 80%+ of DE interviews.",
         impact:"CRITICAL — SQL round exists in every DE interview. Solve 30+ problems before applying.",
         taster:{name:"Store Analytics SQL Report", desc:"5 queries: top 10 customers by spend, monthly revenue trend, products never ordered, customers with >3 orders, average days between orders. Export results to CSV.", skills:["SQL","MySQL"]}
      },
      { id:"git", name:"Git & GitHub", week:"5", days:[
        "Create GitHub account. Install git. git config with your name/email. Create first repo 'de-learning'. git init, add, commit, push.",
        "Create branches: git checkout -b feature/sql-practice. Commit your SQL files. git merge back to main. Delete branch.",
        "Write a proper README.md for your de-learning repo: what it is, what you've built, tech stack, how to run. This is your portfolio."
      ], where:"GitHub Skills (skills.github.com, free) | Pro Git Book (git-scm.com/book, free) | Atlassian Git Tutorials",
         why:"Recruiters look at GitHub before your interview. A clean GitHub with documented projects gets you the interview.",
         impact:"HIGH — Empty or messy GitHub = doubt. Clean repos with READMEs = confidence.",
         taster:{name:"Portfolio README", desc:"Write a GitHub README for your CSV ETL project with: problem statement, tech stack, architecture diagram (ASCII art is fine), how to run it, sample output. Push to GitHub.", skills:["Git","English"]}
      },
      { id:"linux_bash", name:"Linux & Bash Scripting", week:"6", days:[
        "Advanced grep: -r (recursive), -n (line numbers), -i (case insensitive). Search for 'error' in all .log files in a folder.",
        "Write your first bash script: reads a folder path, counts .csv files, prints their names and sizes. Make it executable (chmod +x).",
        "Cron jobs: schedule your Python CSV script to run at 8am every day. Redirect output to a log file. Verify it ran.",
        "Environment variables: set DB_HOST, DB_USER, DB_PASS in .env. Read them in Python with os.environ. NEVER hardcode credentials."
      ], where:"The Missing Semester MIT (missing.csail.mit.edu, free) | OverTheWire: Bandit | linuxcommand.org",
         why:"Data engineers run pipelines on Linux servers. Log inspection, killing processes, cron jobs — daily tasks.",
         impact:"HIGH — Linux knowledge is assumed in every DE role.",
         taster:{name:"Automated File Pipeline", desc:"Bash script: scans /data/incoming every minute (cron), moves new .csv files to /data/processing, runs Python ETL on them, moves to /data/done, logs everything with timestamp to pipeline.log.", skills:["Linux","Bash","Python"]}
      }
    ]
  },
  {
    id:"p2", num:"02", title:"Intermediate Stack", sub:"Week 7–12",
    color:"#1648d6", emoji:"⚙️",
    desc:"AWS Core + Airflow + dbt + Data Modeling — the heart of every DE job",
    skills:[
      { id:"python_eng", name:"Python Engineering Level", week:"7", days:[
        "OOP: rewrite your CSV ETL as a class ETLPipeline with methods extract(), transform(), load(). __init__ takes config dict.",
        "Decorators: write @retry(max_attempts=3) decorator. Apply to your extract() method. Test with a bad file path.",
        "Logging module: replace all print() with logging.info/warning/error. Write logs to both console and pipeline.log file.",
        "Boto3: pip install boto3. Upload a file to S3 with boto3. List bucket contents. Download a file. These 3 operations are used daily.",
        "pytest: write 3 unit tests for your ETLPipeline class. Test happy path, missing file, and empty CSV. Run with pytest -v."
      ], where:"Real Python (realpython.com, free) | Boto3 Official Docs | Python Testing with pytest",
         why:"Production pipelines must be modular, testable, debuggable. Boto3 is the AWS SDK — every AWS interaction from Python uses it.",
         impact:"CRITICAL — Clean engineering Python separates junior candidates from strong ones.",
         taster:{name:"Production-Grade CSV Loader", desc:"Refactor CSV ETL into a class with: logging, @retry decorator, boto3 S3 upload, pytest tests, and a config.json instead of hardcoded paths. This is what production Python looks like.", skills:["Python OOP","Boto3","Testing"]}
      },
      { id:"adv_sql", name:"Advanced SQL", week:"7", days:[
        "Window functions: ROW_NUMBER() OVER (PARTITION BY city ORDER BY created_at). Find each customer's first order.",
        "RANK vs DENSE_RANK: rank customers by spend within each city. Understand the difference with tied values.",
        "LAG and LEAD: calculate day-over-day revenue change. LAG(revenue,1) OVER (ORDER BY date). Real interview question.",
        "FIRST_VALUE, LAST_VALUE: find each customer's first and most recent order in a single query using window functions.",
        "Recursive CTE: generate date spine (sequence of all dates in a range). Essential for filling gaps in time series data.",
        "DataLemur: solve 5 MEDIUM problems. Time yourself. These are exact questions from Amazon and Stripe DE interviews.",
        "EXPLAIN ANALYZE on your slowest query. Add an index. Run again. Measure improvement. This is query optimization."
      ], where:"DataLemur.com | StrataScratch.com | Use The Index Luke (use-the-index-luke.com)",
         why:"Window functions appear in 80%+ of DE SQL interview rounds at Amazon, Swiggy, Razorpay, PhonePe.",
         impact:"CRITICAL — Most tested skill in DE interviews across all companies.",
         taster:{name:"Window Functions Analytics Report", desc:"(1) running total of daily revenue, (2) 7-day moving average of sales, (3) customer rank by spend within city using DENSE_RANK, (4) month-over-month growth % using LAG. One query each.", skills:["Advanced SQL","Window Functions"]}
      },
      { id:"aws_core1", name:"AWS S3 + Glue + Athena", week:"8", days:[
        "AWS Free Tier: create account. Create S3 bucket 'de-aditya-raw'. Upload your CSV. Enable versioning. Set lifecycle: move to IA after 30 days.",
        "S3 folder structure: create bronze/silver/gold prefixes. Upload raw CSV to bronze/. This is your medallion architecture.",
        "AWS Glue: create Crawler over your S3 bronze/ folder. Run it. Check the Data Catalog — Glue auto-detected your schema!",
        "Glue ETL job: write a PySpark Glue script that reads from bronze/, drops nulls, writes Parquet to silver/. Run it.",
        "Athena: query your silver/ Parquet data with SQL. Compare query time + cost vs querying raw CSV. Write it down.",
        "Add partitioning: modify your Glue job to partition output by year/month. Re-query in Athena. Cost drops significantly.",
        "End-to-end test: new CSV to bronze/ → Glue transforms → Parquet in silver/ → Athena query. Screenshot for GitHub."
      ], where:"AWS Free Tier (aws.amazon.com/free) | AWS Skill Builder (skillbuilder.aws, free) | AWS Big Data Blog",
         why:"S3 + Glue + Athena is the most common serverless AWS DE stack. Used at Amazon, Razorpay, Freshworks, Meesho.",
         impact:"CRITICAL — This trio covers 60% of entry-level AWS DE job requirements.",
         taster:{name:"Serverless Data Lake v1", desc:"Upload 3 months of sales CSV to S3 bronze/ → Glue Crawler detects schema → Glue ETL transforms + partitions by month → Parquet in silver/ → Athena query: monthly revenue by city. Add to GitHub with architecture diagram.", skills:["S3","Glue","Athena","PySpark"]}
      },
      { id:"aws_core2", name:"Redshift + Lambda + IAM", week:"9", days:[
        "Redshift: create cluster (free trial). Create schema + tables matching your star schema design. Understand leader vs compute nodes.",
        "COPY command: load your Parquet from S3 into Redshift using COPY. This is 100x faster than INSERT. Understand IAM role needed.",
        "Distribution styles: change one table to KEY distribution on customer_id. Run a JOIN. Use EXPLAIN to see improvement.",
        "Lambda: create Python Lambda. Handler reads S3 event (file uploaded), prints bucket + key. Test with S3 trigger.",
        "Lambda to Glue: Lambda receives S3 event → calls glue_client.start_job_run(). Test: upload file → Lambda → Glue job starts.",
        "IAM: create a role for your Lambda with only S3:GetObject and Glue:StartJobRun permissions. Least privilege principle.",
        "SNS alert: Lambda sends SNS email on Glue job failure. You now have an event-driven pipeline with monitoring."
      ], where:"AWS docs: Redshift Developer Guide | Lambda Developer Guide | Skill Builder: Security Fundamentals",
         why:"Redshift is the dominant AWS warehouse. Lambda is the event-driven trigger. IAM is the security layer protecting everything.",
         impact:"CRITICAL — Distribution style questions in 60% of AWS DE interviews.",
         taster:{name:"Event-Driven Pipeline", desc:"S3 file upload → triggers Lambda → Lambda starts Glue ETL job → Glue loads to Redshift → Lambda sends SNS success/failure email. All using IAM roles, no hardcoded keys.", skills:["S3","Lambda","Glue","Redshift","IAM"]}
      },
      { id:"data_modeling", name:"Data Modeling", week:"10", days:[
        "Read Kimball: what is a fact table? What is a dimension table? What is grain? Design fact_orders for your store on paper.",
        "SCD Type 1 vs Type 2: understand the difference. When does a customer change their city? Which SCD type tracks history?",
        "SCD Type 2 deep dive: draw dim_customer with effective_date, expiry_date, is_current. Implement in MySQL. Note: MySQL is your source DB — SCD Type 2 logic lives in the warehouse (Redshift/Snowflake), triggered when MySQL sends an UPDATE.",
        "Design a star schema for: Uber ride-sharing. Fact: rides. Dims: driver, rider, location, time, vehicle. Draw it.",
        "Design a star schema for: food delivery app (Swiggy). Fact: orders. Draw 5 dimensions. Define the grain. Timed: 15 minutes."
      ], where:"Kimball Group (kimballgroup.com, free) | dbt Dimensional Modeling Guide | Vertabelo Academy",
         why:"Every DE interview includes: 'Design a data model for X business problem.' SCD Type 2 is guaranteed in dbt/Redshift rounds.",
         impact:"CRITICAL — Schema design in 80%+ of DE interviews. Most common entry-level gap.",
         taster:{name:"Star Schema in Redshift", desc:"Design and CREATE complete star schema in Redshift: fact_orders + dim_customer (SCD Type 2) + dim_product + dim_date. Load data using COPY. Query: monthly revenue by customer city, tracking customers who moved.", skills:["Data Modeling","Redshift","SCD Type 2"]}
      },
      { id:"airflow", name:"Apache Airflow", week:"11", days:[
        "Docker Compose Airflow: spin up local Airflow with docker-compose up. Access UI at localhost:8080. Explore the interface.",
        "Write your first DAG: TaskFlow API style. 3 tasks: extract (reads S3), transform (Python), load (writes S3). Add to dags/ folder.",
        "S3KeySensor: add a sensor task that waits for a file in S3 before starting the pipeline. Test by uploading the file mid-run.",
        "GlueJobOperator: replace manual Lambda trigger with Airflow's GlueJobOperator. DAG now orchestrates Glue directly.",
        "Email alert on failure: configure email_on_failure=True + SMTP. Trigger a failure intentionally. Receive the alert."
      ], where:"Apache Airflow Official Docs | Astronomer Academy (academy.astronomer.io, free) | Astronomer.io Blog",
         why:"Airflow is listed in 70%+ of DE job descriptions. Production patterns (TaskFlow, sensors, AWS operators) signal real readiness.",
         impact:"CRITICAL — Industry standard orchestrator. Already on your resume — upgrade to production patterns.",
         taster:{name:"Airflow Orchestrated Pipeline", desc:"Airflow DAG: S3KeySensor waits for file → PythonOperator validates data → GlueJobOperator runs ETL → RedshiftSQLOperator runs transform → EmailOperator sends completion report. TaskFlow API. Schedule: daily 6am.", skills:["Airflow","S3","Glue","Redshift"]}
      },
      { id:"dbt", name:"dbt Transformation Layer", week:"12", days:[
        "dbt init: create project targeting Redshift. Configure profiles.yml. dbt debug — confirm connection works.",
        "First models: create stg_orders.sql (selects from raw), fct_orders.sql (joins + aggregates). dbt run. Check Redshift.",
        "dbt tests: add not_null, unique, accepted_values to fct_orders. dbt test. Fix any failures in your data.",
        "Snapshot: create dim_customer_snapshot.sql with SCD Type 2 using dbt snapshots. dbt snapshot. Run twice with updated data.",
        "dbt docs: dbt docs generate then dbt docs serve. Screenshot the lineage graph. Add to your GitHub README."
      ], where:"dbt Learn (learn.getdbt.com, free) | dbt Docs (docs.getdbt.com) | dbt Slack Community",
         why:"dbt is listed in 60%+ of DE job descriptions. dbt + Airflow + Redshift is the most common modern DE stack.",
         impact:"CRITICAL — Adding SCD Type 2 snapshots and custom tests immediately upgrades your portfolio.",
         taster:{name:"dbt Transformation Layer", desc:"dbt project on Redshift: staging models for 3 sources, fct_orders with 5 metrics, dim_customer snapshot (SCD Type 2), 10 schema tests, 2 custom tests, Jinja macro for date formatting. dbt docs lineage screenshot in README.", skills:["dbt","Redshift","SQL","Data Modeling"]}
      }
    ]
  },
  {
    id:"p3", num:"03", title:"Advanced Stack", sub:"Week 13–18",
    color:"#166534", emoji:"🚀",
    desc:"Spark, Kafka, Snowflake, Terraform — top 10% DE territory",
    skills:[
      { id:"pyspark", name:"PySpark & AWS EMR", week:"13–14", days:[
        "Install PySpark locally (pip install pyspark). SparkSession. Read CSV as DataFrame. df.show(), df.printSchema(), df.count().",
        "Transformations: select, filter, withColumn, dropna, fillna, cast. Clean your sales data with PySpark.",
        "GroupBy + agg: revenue by city, average order value by month. Compare syntax with Pandas — similar but distributed.",
        "Joins: inner join orders + customers. Understand broadcast join for small tables. df.join(broadcast(small_df), 'id').",
        "Window functions in PySpark: Window.partitionBy().orderBy(). Rank customers by spend. Same logic as SQL window functions.",
        "Write Parquet: df.write.parquet() with partitionBy('year','month'). Read back. Verify partition pruning works.",
        "df.explain(): run explain() on your join query. Understand the physical plan. Spot shuffles. Add broadcast hint.",
        "AWS EMR: create a transient cluster. Submit your PySpark script as an EMR Step. S3 input to S3 output. Monitor in console.",
        "Delta Lake: pip install delta-spark. Convert your Parquet table to Delta. Run MERGE for upserts. Time travel: read yesterday's data.",
        "EMR + Delta + Glue Catalog: register your Delta table in Glue Catalog. Query it from Athena. Full modern lakehouse."
      ], where:"Udemy: Taming Big Data with PySpark — Frank Kane | Delta Lake (delta.io) | AWS EMR Developer Guide",
         why:"PySpark is the engine behind AWS Glue and EMR. Every large-scale production pipeline uses Spark. Delta Lake is the fastest growing table format in 2026.",
         impact:"CRITICAL — PySpark on resume = immediate shortlist. Glue, EMR, Databricks all run Spark.",
         taster:{name:"Distributed ETL on EMR", desc:"PySpark on AWS EMR: read 1M+ row CSV from S3 → clean + transform → window function analytics → write Delta Lake table partitioned by month → register in Glue Catalog → query from Athena. Include df.explain() output in README.", skills:["PySpark","EMR","Delta Lake","S3"]}
      },
      { id:"kafka", name:"Kafka & Kinesis Streaming", week:"15", days:[
        "Docker Compose Kafka: spin up broker + zookeeper + schema registry. Create topic 'orders' with 3 partitions, replication 1.",
        "Python producer: pip install confluent-kafka. Send 100 fake order events as JSON. Verify in Kafka UI.",
        "Python consumer: consume from 'orders' topic. Print each message. Start 2 consumers in same group — messages split between them.",
        "Kafka Connect S3 Sink: configure connector to write topic messages to S3 as Parquet files. Verify S3 every 60 seconds.",
        "Kinesis Firehose: create delivery stream to S3. Send 50 events with boto3 put_record(). Verify Parquet files appear in S3."
      ], where:"Confluent Developer (developer.confluent.io, free) | Kafka: The Definitive Guide | conduktor.io",
         why:"Streaming is the fastest growing area in DE. Kafka is used at Swiggy, Zomato, PhonePe, Razorpay. Entry-level candidates with Kafka knowledge are rare.",
         impact:"HIGH — Kafka on resume = stand out from 80% of entry-level candidates.",
         taster:{name:"Real-Time Order Streaming Pipeline", desc:"Python producer sends fake e-commerce orders to Kafka topic → Kafka Connect S3 Sink writes Parquet to S3 every minute → Glue Crawler updates catalog → Athena queries 'orders in last hour'. Add Kinesis Firehose version as alternative.", skills:["Kafka","Kinesis","S3","Athena"]}
      },
      { id:"snowflake", name:"Snowflake", week:"16", days:[
        "Snowflake free trial: create account. Understand UI: worksheets, databases, warehouses. Create XS virtual warehouse.",
        "Create stage then COPY INTO from S3. Load your sales data. Run SELECT queries. Compare Snowflake auto-suspend vs Redshift always-on.",
        "Snowpipe: create pipe with auto_ingest=true. Upload a file to S3. Snowpipe auto-loads it within seconds. Verify.",
        "Time travel: UPDATE 10 rows. Run: SELECT * FROM orders AT(offset => -60*5). See data from 5 minutes ago.",
        "dbt + Snowflake: update profiles.yml to point to Snowflake. Run dbt run. Your same dbt models now run on Snowflake."
      ], where:"Snowflake University (learn.snowflake.com, free) | Kahan Data Solutions YouTube | Snowflake 30-day free trial",
         why:"Snowflake appears in 60%+ of DE job descriptions. The #1 cloud warehouse for startups in 2026.",
         impact:"HIGH — Redshift + Snowflake together on resume is extremely powerful.",
         taster:{name:"Snowflake Auto-Ingest Pipeline", desc:"S3 → Snowpipe auto-ingest → Snowflake table → dbt transformation models → query results. Demonstrate time travel: UPDATE data, query historic version, show UNDROP. Put lineage screenshot in README.", skills:["Snowflake","Snowpipe","dbt","S3"]}
      },
      { id:"api_ingestion", name:"REST API Ingestion", week:"17", days:[
        "requests library: GET request to OpenWeatherMap API (free key). Print JSON response. Understand headers, params, status codes.",
        "Pagination: find an API with paginated results (GitHub, Reddit). Write a loop that fetches ALL pages. Handle rate limits with time.sleep().",
        "Full pipeline: requests → parse JSON → write to S3 as raw JSON → Glue converts to Parquet → Athena query. Schedule with cron."
      ], where:"Real Python: requests library (free) | Public APIs List (github.com/public-apis) | OpenWeatherMap API (free tier)",
         why:"80% of DE jobs ingest data from SaaS APIs: Salesforce, Razorpay, Shopify. REST API ingestion is a daily task.",
         impact:"HIGH — REST API ingestion in 80% of DE job descriptions. One project closes this gap completely.",
         taster:{name:"Weather Data Pipeline", desc:"Airflow DAG: HttpSensor checks API is live → PythonOperator fetches 7 days of weather for 5 Indian cities → stores raw JSON in S3 bronze/ → Glue ETL to Parquet in silver/ → Athena: city with most rain this week.", skills:["REST API","Airflow","S3","Glue","Athena"]}
      },
      { id:"terraform", name:"Terraform + Docker + CI/CD", week:"18", days:[
        "Terraform: terraform init with AWS provider. Write main.tf to create an S3 bucket. terraform plan then terraform apply. Watch it appear.",
        "Add IAM role + Glue job to Terraform. Use variables.tf and outputs.tf. terraform destroy — tear it all down with one command.",
        "Terraform S3 backend: store state in S3 + DynamoDB lock. Infrastructure state is now safe and team-shareable.",
        "Docker: write Dockerfile for your Python ETL script. docker build then docker run. Push image to Amazon ECR.",
        "GitHub Actions: write .github/workflows/dbt_test.yml. On every PR: checkout, pip install dbt, dbt test. Break a test intentionally."
      ], where:"HashiCorp Learn (developer.hashicorp.com/terraform, free) | Docker docs | freeCodeCamp GitHub Actions YouTube",
         why:"Production DE requires IaC. Terraform means you can rebuild your entire data lake in 5 minutes.",
         impact:"HIGH — IaC on a resume signals senior-level thinking even at entry level.",
         taster:{name:"Infrastructure as Code Pipeline", desc:"Terraform provisions: S3 bucket (bronze/silver/gold), IAM role, Glue job, Glue catalog database. GitHub Actions CI: runs dbt test on PR, deploys Glue script on merge to main. Docker image for Python ETL pushed to ECR.", skills:["Terraform","Docker","GitHub Actions","Glue","IAM"]}
      }
    ]
  },
  {
    id:"p4", num:"04", title:"Expert Level", sub:"Week 19–22",
    color:"#b45309", emoji:"🏆",
    desc:"Data Quality, Governance, System Design, AWS DEA-C01 — top 5%",
    skills:[
      { id:"data_quality", name:"Data Quality & Observability", week:"19", days:[
        "Great Expectations: pip install great_expectations. ge init. Create expectation suite on your sales data. Run checkpoint.",
        "GE + Airflow: add GE checkpoint as a task BEFORE your Redshift load. If data quality fails, pipeline stops. Test with bad data.",
        "CloudWatch: create metric alarm for Glue job failure. SNS topic sends email. Add custom metric for records processed."
      ], where:"Great Expectations Docs (docs.greatexpectations.io, free) | dbt Testing Guide | AWS CloudWatch Getting Started",
         why:"Bad data silently corrupts downstream reports. Senior DEs own data quality end-to-end, not just pipeline execution.",
         impact:"HIGH — Data quality knowledge signals production maturity.",
         taster:{name:"Data Quality Gateway", desc:"Airflow pipeline with GE checkpoint: (1) extract data, (2) GE validates (no nulls, value ranges, row count > 0), (3) if pass load to Redshift, (4) if fail send SNS alert + move to /quarantine folder on S3. CloudWatch alarm for Glue failures.", skills:["Great Expectations","Airflow","Redshift","CloudWatch"]}
      },
      { id:"governance", name:"Lake Formation & Governance", week:"20", days:[
        "Lake Formation: enable in AWS console. Register your S3 data lake. Understand LF permissions vs IAM permissions.",
        "Column-level security: grant a test IAM user access to orders table but HIDE the customer_email column. Verify in Athena.",
        "AWS Macie: enable on your S3 bucket. Let it scan for PII. Review findings. Understand why this matters for GDPR."
      ], where:"AWS Lake Formation Workshop (workshop.aws, free) | AWS Skill Builder: Lake Formation | AWS docs",
         why:"Enterprises require data governance. Lake Formation is heavily tested in AWS DEA-C01 Domain 4 (Security, 18% of exam).",
         impact:"HIGH — Governance knowledge distinguishes you in fintech and enterprise DE roles.",
         taster:{name:"Governed Data Lake", desc:"Lake Formation: register data lake, create 3 IAM users with different permissions (analyst sees aggregated only, engineer sees all, intern sees no PII columns). Verify each user's Athena queries return correct subset. Document findings.", skills:["Lake Formation","IAM","Athena","Governance"]}
      },
      { id:"system_design", name:"System Design for DE", week:"21", days:[
        "Designing Data-Intensive Applications: read Ch.1 (Reliable, Scalable, Maintainable). Take notes on trade-offs.",
        "Design: batch pipeline for an e-commerce company. 20 minutes timed. Diagram: sources to ingestion to storage to transform to serve.",
        "Design: real-time fraud detection pipeline. Kafka to processing to alert within 500ms. What storage? What processing?",
        "Design: data lakehouse for a startup (low cost). Constraints: <$500/month, 10TB data, 50 analysts. Redshift vs Athena trade-offs?",
        "Record yourself presenting one system design. 10 minutes. Play back. Does your explanation make sense?"
      ], where:"Designing Data-Intensive Applications — Martin Kleppmann | ByteByteGo YouTube (free) | High Scalability Blog",
         why:"System design rounds test whether you can architect a solution from scratch. Every senior DE interview includes at least one system design question.",
         impact:"CRITICAL — System design is the final gate before offer.",
         taster:{name:"System Design Document", desc:"Write a 1-page technical design doc: 'Design a real-time sales analytics platform for a food delivery startup — ingesting 10K orders/minute, dashboard updated every 30 seconds, max $200/month AWS cost.' Include architecture diagram, service choices with justifications, trade-offs.", skills:["System Design","Kafka","Redshift","Athena"]}
      },
      { id:"cert", name:"AWS DEA-C01 Certification", week:"22", days:[
        "Download DEA-C01 exam guide from AWS. Read all 4 domains. Note which services you know well vs gaps.",
        "AWS Skill Builder: start DEA-C01 learning plan. Complete Domain 1 modules (Data Ingestion & Transformation).",
        "AWS Skill Builder: Domain 2 (Data Store Management). Focus on Redshift, Athena, DynamoDB decision criteria.",
        "Tutorials Dojo: buy practice exam pack (~Rs 1200). Take first full 65-question practice exam. Note every wrong answer.",
        "Review all wrong answers from Day 4. Read the AWS documentation for each service you got wrong.",
        "Tutorials Dojo: second full practice exam. Must score 80%+ before scheduling real exam.",
        "Schedule real exam. Update LinkedIn to 'AWS DEA-C01 in progress'. Post on LinkedIn about your learning journey."
      ], where:"AWS Skill Builder DEA-C01 Learning Plan (free) | Udemy: Stephane Maarek DEA-C01 (~Rs 500) | Tutorials Dojo DEA-C01 (~Rs 1200)",
         why:"For a candidate without formal work experience, the AWS DEA-C01 cert is the most powerful credibility signal you can add to your resume.",
         impact:"CRITICAL — 'AWS Certified Data Engineer' in resume headline triggers recruiter callbacks.",
         taster:null
      }
    ]
  }
];

const COMBOS = [
  { id:"c1", title:"Full Serverless Batch Pipeline", level:"INTERMEDIATE", color:"#1648d6",
    unlockAfter:["aws_core1","aws_core2"],
    skills:"S3 · Glue · Athena · Redshift · Lambda · IAM",
    desc:"Complete serverless batch pipeline: daily CSV upload triggers Lambda → Glue ETL transforms to Parquet → loads to Redshift → Athena serves BI queries. All infra uses IAM roles. CloudWatch alarm for failures.",
    deliverable:"GitHub repo with: architecture diagram, Glue script, Lambda code, Athena queries, Redshift loaded screenshot."
  },
  { id:"c2", title:"Airflow + dbt + Redshift Production Pipeline", level:"INTERMEDIATE", color:"#0f766e",
    unlockAfter:["airflow","dbt","data_modeling"],
    skills:"Airflow · dbt · Redshift · Data Modeling · SQL",
    desc:"Airflow DAG: S3KeySensor waits for daily data → GlueJobOperator runs ETL → dbt runs 10 transformation models including SCD Type 2 snapshot → data quality tests pass → dashboard-ready gold tables in Redshift.",
    deliverable:"GitHub with full Airflow DAG, dbt project with lineage graph screenshot, and Redshift query results."
  },
  { id:"c3", title:"PySpark + Delta Lake + Glue Lakehouse", level:"ADVANCED", color:"#166534",
    unlockAfter:["pyspark","aws_core1"],
    skills:"PySpark · Delta Lake · EMR · Glue · S3 · Athena",
    desc:"Modern lakehouse: PySpark on EMR reads raw S3 data → transforms with window functions → writes Delta Lake format with MERGE upserts → registers in Glue Catalog → Athena queries with time travel. Great Expectations validation.",
    deliverable:"GitHub with EMR bootstrap script, PySpark script, Delta Lake MERGE logic, and Athena time-travel query examples."
  },
  { id:"c4", title:"Real-Time Lambda Architecture (Streaming + Batch)", level:"ADVANCED", color:"#5b21b6",
    unlockAfter:["kafka","airflow","aws_core2"],
    skills:"Kafka · Kinesis · Airflow · S3 · Redshift · Athena",
    desc:"Lambda architecture: Kafka streaming path → Kinesis Firehose → S3 → real-time Athena queries (speed layer). Airflow batch path → full historical Redshift load (batch layer). Serving layer: unified view merging both.",
    deliverable:"GitHub with Docker Compose Kafka, Kinesis config, Airflow DAGs, and unified Athena query combining both layers."
  },
  { id:"c5", title:"Full Modern Data Stack — Capstone Project", level:"EXPERT", color:"#b45309",
    unlockAfter:["pyspark","kafka","snowflake","terraform","dbt"],
    skills:"Python · SQL · S3 · Glue · Redshift · Airflow · dbt · PySpark · Kafka · Snowflake · Terraform · GE · CloudWatch",
    desc:"The flagship project every recruiter wants to see. REST API ingestion → Kafka streaming → S3 data lake (Delta Lake) → dbt transforms → Snowflake analytics warehouse → Airflow orchestration → Terraform IaC → GitHub Actions CI/CD → Great Expectations quality → CloudWatch monitoring.",
    deliverable:"Public GitHub repo with full README, architecture diagram, Terraform, Docker Compose, all scripts. This IS your portfolio."
  }
];

const SCHEDULE = [
  {wk:"1",  skill:"Math + English",                     phase:"PHASE 0", resource:"Khan Academy + BBC Learning English", action:"30 min math daily. Write one paragraph in English."},
  {wk:"2",  skill:"CS Fundamentals + Linux",            phase:"PHASE 0", resource:"CS50 + linuxcommand.org",             action:"Open terminal every day. cd/ls/grep."},
  {wk:"3–4",skill:"Python Foundation",                  phase:"PHASE 1", resource:"Automate the Boring Stuff (free)",    action:"Build 3 scripts/day. No tutorials without code."},
  {wk:"4–5",skill:"SQL Foundation (MySQL)",              phase:"PHASE 1", resource:"SQLZoo + DataLemur.com",             action:"5 DataLemur problems/day. Start streak now."},
  {wk:"5",  skill:"Git + GitHub",                       phase:"PHASE 1", resource:"GitHub Skills (free)",                action:"Every project on GitHub with README from today."},
  {wk:"6",  skill:"Linux + Bash Scripting",             phase:"PHASE 1", resource:"Missing Semester MIT (free)",         action:"Write a bash script. Schedule with cron."},
  {wk:"7",  skill:"Python Engineering + Advanced SQL",  phase:"PHASE 2", resource:"Real Python + DataLemur (medium)",   action:"Rewrite pipeline as class. Solve 5 medium SQL/day."},
  {wk:"8–9",skill:"AWS S3 + Glue + Athena",             phase:"PHASE 2", resource:"AWS Free Tier + Skill Builder",      action:"End-to-end: CSV to S3 to Glue to Parquet to Athena."},
  {wk:"9–10",skill:"Redshift + Lambda + IAM",           phase:"PHASE 2", resource:"AWS docs + Skill Builder",           action:"S3 trigger to Lambda to Glue to Redshift pipeline."},
  {wk:"10", skill:"Data Modeling",                      phase:"PHASE 2", resource:"Kimball Group + dbt guide",          action:"Design 5 star schemas on paper. Timed 15 min each."},
  {wk:"11", skill:"Apache Airflow",                     phase:"PHASE 2", resource:"Astronomer Academy (free)",          action:"Refactor DAGs to TaskFlow + GlueJobOperator."},
  {wk:"12", skill:"dbt",                                phase:"PHASE 2", resource:"dbt Learn (free, official)",         action:"Add SCD Type 2 snapshot to dimension table."},
  {wk:"13–14",skill:"PySpark + EMR + Delta Lake",       phase:"PHASE 3", resource:"Frank Kane Udemy + delta.io",        action:"Migrate Glue job to EMR. Add Delta MERGE."},
  {wk:"15", skill:"Kafka + Kinesis",                    phase:"PHASE 3", resource:"Confluent Developer (free)",         action:"Docker Kafka to events to S3 Parquet to Athena."},
  {wk:"16", skill:"Snowflake",                          phase:"PHASE 3", resource:"learn.snowflake.com (free trial)",   action:"Snowpipe auto-ingest from S3 + dbt on Snowflake."},
  {wk:"17", skill:"REST API Ingestion",                 phase:"PHASE 3", resource:"Real Python + public-apis",          action:"OpenWeatherMap API to S3 to Glue to Athena DAG."},
  {wk:"18", skill:"Terraform + Docker + CI/CD",         phase:"PHASE 3", resource:"HashiCorp Learn + Docker docs",      action:"Terraform provisions S3+IAM+Glue. GH Actions dbt."},
  {wk:"19", skill:"Data Quality + CloudWatch",          phase:"PHASE 4", resource:"Great Expectations docs",            action:"GE checkpoint in Airflow before Redshift load."},
  {wk:"20", skill:"Lake Formation + Governance",        phase:"PHASE 4", resource:"AWS LF Workshop (free)",             action:"Set column-level permissions. Verify in Athena."},
  {wk:"21", skill:"System Design Practice",             phase:"PHASE 4", resource:"Designing Data-Intensive Applications", action:"20-min timed design daily. Talk out loud."},
  {wk:"22", skill:"AWS DEA-C01 Exam",                   phase:"PHASE 4", resource:"Tutorials Dojo practice exams",      action:"80%+ on 2 practice tests. Schedule real exam."}
];

const CHECKLIST = [
  { phase:"PHASE 0 — ABSOLUTE BASICS", color:"#9333ea", items:[
    "Understand percentages, averages, mean/median/standard deviation",
    "Can read and write clear technical English (READMEs, emails, Slack messages)",
    "Know difference between CSV, JSON, Parquet and when to use each",
    "Comfortable in Linux terminal: cd, ls, grep, cat, chmod, cron jobs",
    "Completed: Data Quality Math Check taster project",
    "Completed: Log File Inspector taster project"
  ]},
  { phase:"PHASE 1 — BEGINNER CORE", color:"#0f766e", items:[
    "Can write Python scripts (not notebooks) with functions, loops, error handling, and file I/O",
    "All projects are on GitHub with clear READMEs",
    "Can write SELECT, JOIN, GROUP BY, aggregate functions confidently in SQL (MySQL)",
    "Solved 30+ SQL problems on DataLemur (beginner + easy level)",
    "GitHub profile has at least 3 repos with proper READMEs",
    "Can write bash scripts and schedule them with cron",
    "Completed: Mini CSV ETL Pipeline taster project",
    "Completed: Store Analytics SQL Report (MySQL) taster project",
    "Completed: Portfolio README taster project",
    "Completed: Automated File Pipeline taster project"
  ]},
  { phase:"PHASE 2 — INTERMEDIATE STACK", color:"#1648d6", items:[
    "Python uses classes, logging, decorators, type hints, and pytest tests",
    "Boto3 can upload, list, and download from S3",
    "Solved 30+ SQL window function problems on DataLemur (medium level)",
    "Built end-to-end: CSV to S3 to Glue to Parquet to Athena (hands-on)",
    "Built event-driven: S3 upload triggers Lambda triggers Glue loads Redshift",
    "Can explain Redshift KEY/ALL/EVEN distribution styles and sort key choices",
    "Can design a star schema from any business problem in under 15 minutes",
    "Airflow DAGs use TaskFlow API with AWS operators and S3KeySensor",
    "dbt project has models, schema tests, SCD Type 2 snapshots, and macros",
    "Completed: Production-Grade CSV Loader taster",
    "Completed: Window Functions Analytics Report taster",
    "Completed: Serverless Data Lake v1 taster",
    "Completed: Event-Driven Pipeline taster",
    "Completed: Star Schema in Redshift taster",
    "Completed: Airflow Orchestrated Pipeline taster",
    "Completed: dbt Transformation Layer taster",
    "Completed: COMBO 1 — Full Serverless Batch Pipeline",
    "Completed: COMBO 2 — Airflow + dbt + Redshift Production Pipeline"
  ]},
  { phase:"PHASE 3 — ADVANCED STACK", color:"#166534", items:[
    "PySpark project on EMR with Delta Lake MERGE and df.explain() optimization on GitHub",
    "Can explain broadcast joins, repartition vs coalesce, execution stages",
    "Kafka pipeline: producer to topic to consumer to S3 Parquet to Athena on GitHub",
    "Snowpipe auto-ingest from S3 to Snowflake + dbt models on Snowflake working",
    "REST API ingestion pipeline: API to S3 to Glue to Athena scheduled by Airflow",
    "Terraform provisions S3 + IAM + Glue as code, committed to GitHub",
    "GitHub Actions CI runs dbt test on every pull request before merge",
    "Completed: Distributed ETL on EMR taster",
    "Completed: Real-Time Order Streaming Pipeline taster",
    "Completed: Snowflake Auto-Ingest Pipeline taster",
    "Completed: Weather Data Pipeline taster",
    "Completed: Infrastructure as Code Pipeline taster",
    "Completed: COMBO 3 — PySpark + Delta Lake + Glue Lakehouse",
    "Completed: COMBO 4 — Real-Time Lambda Architecture"
  ]},
  { phase:"PHASE 4 — EXPERT LEVEL", color:"#b45309", items:[
    "Great Expectations checkpoint runs in Airflow before every Redshift load",
    "CloudWatch alarm triggers SNS on Glue or Lambda failure",
    "Lake Formation column-level access control configured and verified in Athena",
    "Can design batch + streaming pipeline in 20-minute system design interview",
    "AWS Certified Data Engineer – Associate (DEA-C01) passed",
    "Resume headline includes: Python · SQL/MySQL · AWS · PySpark · Airflow · dbt · Kafka · Snowflake · DEA-C01",
    "Applied to 30+ companies. Completed 5+ mock interviews on Pramp.com",
    "Both GitHub projects have detailed READMEs with architecture diagrams",
    "Completed: Data Quality Gateway taster",
    "Completed: Governed Data Lake taster",
    "Completed: System Design Document taster",
    "Completed: COMBO 5 — Full Modern Data Stack Capstone"
  ]}
];
